const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstate", function () {
  let realEstate, owner, seller, buyer, reviewer, stranger;

  const toWei = (n) => ethers.parseEther(String(n));

  beforeEach(async function () {
    [owner, seller, buyer, reviewer, stranger] = await ethers.getSigners();

    const RealEstate = await ethers.getContractFactory("RealEstate");
    realEstate = await RealEstate.deploy();
    await realEstate.waitForDeployment();
  });

  // ── Listing ───────────────────────────────────────────────────────────────
  describe("Listing properties", function () {
    it("lists a property successfully", async function () {
      const tx = await realEstate.listProperty(
        seller.address,
        toWei(10),
        "Modern Villa",
        "Residential",
        "ipfs://image1",
        "123 Main St",
        "A beautiful modern villa"
      );
      await expect(tx)
        .to.emit(realEstate, "propertyListed")
        .withArgs(1n, seller.address, toWei(10));

      expect(await realEstate.propertyIndex()).to.equal(1n);
    });

    it("rejects listing with zero price", async function () {
      await expect(
        realEstate.listProperty(
          seller.address, 0, "Villa", "Residential", "img", "addr", "desc"
        )
      ).to.be.revertedWith("price must be greater than 0");
    });

    it("returns correct id for first and second property", async function () {
      await realEstate.listProperty(seller.address, toWei(5), "A", "Cat", "img", "addr", "desc");
      const id1 = await realEstate.propertyIndex();
      await realEstate.listProperty(seller.address, toWei(8), "B", "Cat", "img", "addr", "desc");
      const id2 = await realEstate.propertyIndex();

      expect(id1).to.equal(1n);
      expect(id2).to.equal(2n);
    });

    it("stores property data correctly", async function () {
      await realEstate.listProperty(
        seller.address, toWei(15), "Beach House", "Vacation", "img.png", "456 Coast Rd", "Ocean view"
      );

      const property = await realEstate.getProperty(1);
      expect(property[0]).to.equal(1n);             // productID
      expect(property[1]).to.equal(seller.address);  // owner
      expect(property[2]).to.equal(toWei(15));        // price
      expect(property[3]).to.equal("Beach House");
      expect(property[4]).to.equal("Vacation");
      expect(property[5]).to.equal("img.png");
      expect(property[6]).to.equal("456 Coast Rd");
      expect(property[7]).to.equal("Ocean view");
    });
  });

  // ── Updating ──────────────────────────────────────────────────────────────
  describe("Updating properties", function () {
    beforeEach(async function () {
      await realEstate.listProperty(
        seller.address, toWei(10), "Villa", "Residential", "img", "addr", "desc"
      );
    });

    it("owner can update property details", async function () {
      await realEstate.updateProperty(
        seller.address, 1, "Updated Villa", "Luxury", "newimg", "789 New Rd", "Renovated"
      );
      const property = await realEstate.getProperty(1);
      expect(property[3]).to.equal("Updated Villa");
      expect(property[4]).to.equal("Luxury");
    });

    it("non-owner cannot update property", async function () {
      await expect(
        realEstate.updateProperty(
          stranger.address, 1, "Hacked", "Cat", "img", "addr", "desc"
        )
      ).to.be.revertedWith("you are not the owner");
    });

    it("owner can update price", async function () {
      await realEstate.updatePrice(seller.address, 1, toWei(20));
      const property = await realEstate.getProperty(1);
      expect(property[2]).to.equal(toWei(20));
    });

    it("non-owner cannot update price", async function () {
      await expect(
        realEstate.updatePrice(stranger.address, 1, toWei(99))
      ).to.be.revertedWith("you are not the owner");
    });

    it("rejects zero price update", async function () {
      await expect(
        realEstate.updatePrice(seller.address, 1, 0)
      ).to.be.revertedWith("price must be greater than 0");
    });
  });

  // ── Buying ────────────────────────────────────────────────────────────────
  describe("Buying properties", function () {
    beforeEach(async function () {
      await realEstate.listProperty(
        seller.address, toWei(10), "Villa", "Residential", "img", "addr", "desc"
      );
    });

    it("allows buying a property with sufficient funds", async function () {
      await realEstate.connect(buyer).buyProperty(1, buyer.address, { value: toWei(10) });
      const property = await realEstate.getProperty(1);
      expect(property[1]).to.equal(buyer.address);
    });

    it("transfers funds to the seller", async function () {
      const before = await ethers.provider.getBalance(seller.address);
      await realEstate.connect(buyer).buyProperty(1, buyer.address, { value: toWei(10) });
      const after = await ethers.provider.getBalance(seller.address);
      expect(after - before).to.equal(toWei(10));
    });

    it("emits propertySold event", async function () {
      await expect(
        realEstate.connect(buyer).buyProperty(1, buyer.address, { value: toWei(10) })
      ).to.emit(realEstate, "propertySold").withArgs(1n, seller.address, buyer.address, toWei(10));
    });

    it("rejects insufficient payment", async function () {
      await expect(
        realEstate.connect(buyer).buyProperty(1, buyer.address, { value: toWei(5) })
      ).to.be.revertedWith("insufficient funds");
    });

    it("rejects buying a non-existent property", async function () {
      await expect(
        realEstate.connect(buyer).buyProperty(99, buyer.address, { value: toWei(10) })
      ).to.be.revertedWith("property does not exist");
    });

    it("rejects owner buying their own property", async function () {
      await expect(
        realEstate.connect(seller).buyProperty(1, seller.address, { value: toWei(10) })
      ).to.be.revertedWith("owner cannot buy own property");
    });

    it("allows resale to a new buyer", async function () {
      await realEstate.connect(buyer).buyProperty(1, buyer.address, { value: toWei(10) });
      await realEstate.connect(stranger).buyProperty(1, stranger.address, { value: toWei(10) });
      const property = await realEstate.getProperty(1);
      expect(property[1]).to.equal(stranger.address);
    });
  });

  // ── Reading properties ────────────────────────────────────────────────────
  describe("Reading properties", function () {
    beforeEach(async function () {
      await realEstate.listProperty(seller.address, toWei(5), "A", "Cat1", "img", "addr1", "desc1");
      await realEstate.listProperty(buyer.address, toWei(8), "B", "Cat2", "img", "addr2", "desc2");
    });

    it("getAllProperties returns all listed properties", async function () {
      const all = await realEstate.getAllProperties();
      expect(all.length).to.equal(2);
      expect(all[0].propertyTitle).to.equal("A");
      expect(all[1].propertyTitle).to.equal("B");
    });

    it("getUserProperties returns only that user's properties", async function () {
      const sellerProps = await realEstate.getUserProperties(seller.address);
      expect(sellerProps.length).to.equal(1);
      expect(sellerProps[0].propertyTitle).to.equal("A");
    });

    it("returns empty array for user with no properties", async function () {
      const strangerProps = await realEstate.getUserProperties(stranger.address);
      expect(strangerProps.length).to.equal(0);
    });
  });

  // ── Reviews ───────────────────────────────────────────────────────────────
  describe("Reviews", function () {
    beforeEach(async function () {
      await realEstate.listProperty(seller.address, toWei(10), "Villa", "Residential", "img", "addr", "desc");
    });

    it("allows adding a review", async function () {
      await realEstate.addReview(1, 5, "Amazing property!", reviewer.address);
      const reviewsList = await realEstate.getProductReviews(1);
      expect(reviewsList.length).to.equal(1);
      expect(reviewsList[0].rating).to.equal(5n);
      expect(reviewsList[0].comment).to.equal("Amazing property!");
    });

    it("emits ReviewAdded event", async function () {
      await expect(
        realEstate.addReview(1, 4, "Pretty good", reviewer.address)
      ).to.emit(realEstate, "ReviewAdded").withArgs(1n, reviewer.address, 4n, "Pretty good");
    });

    it("rejects rating below 1", async function () {
      await expect(
        realEstate.addReview(1, 0, "Bad", reviewer.address)
      ).to.be.revertedWith("ratings must be between one and five");
    });

    it("rejects rating above 5", async function () {
      await expect(
        realEstate.addReview(1, 6, "Too good", reviewer.address)
      ).to.be.revertedWith("ratings must be between one and five");
    });

    it("rejects review on non-existent property", async function () {
      await expect(
        realEstate.addReview(99, 5, "Nice", reviewer.address)
      ).to.be.revertedWith("property does not exist");
    });

    it("increments reviewsCounter", async function () {
      await realEstate.addReview(1, 5, "Great", reviewer.address);
      expect(await realEstate.reviewsCounter()).to.equal(1n);
    });

    it("tracks reviews per user", async function () {
      await realEstate.addReview(1, 5, "Great", reviewer.address);
      const userRevs = await realEstate.getUserReviews(reviewer.address);
      expect(userRevs.length).to.equal(1);
      expect(userRevs[0].comment).to.equal("Great");
    });

    it("allows liking a review", async function () {
      await realEstate.addReview(1, 5, "Great", reviewer.address);
      await realEstate.likeReview(1, 0, stranger.address);
      const reviewsList = await realEstate.getProductReviews(1);
      expect(reviewsList[0].likes).to.equal(1n);
    });

    it("emits ReviewLiked event", async function () {
      await realEstate.addReview(1, 5, "Great", reviewer.address);
      await expect(
        realEstate.likeReview(1, 0, stranger.address)
      ).to.emit(realEstate, "ReviewLiked").withArgs(1n, 0n, stranger.address, 1n);
    });

    it("rejects liking an invalid review index", async function () {
      await expect(
        realEstate.likeReview(1, 99, stranger.address)
      ).to.be.revertedWith("invalid review index");
    });
  });

  // ── Highest rated ─────────────────────────────────────────────────────────
  describe("getHighestRatedProduct", function () {
    it("returns 0 when no reviews exist", async function () {
      await realEstate.listProperty(seller.address, toWei(10), "Villa", "Cat", "img", "addr", "desc");
      expect(await realEstate.getHighestRatedProduct()).to.equal(0n);
    });

    it("returns the property with the highest average rating", async function () {
      await realEstate.listProperty(seller.address, toWei(10), "Villa A", "Cat", "img", "addr", "desc");
      await realEstate.listProperty(seller.address, toWei(10), "Villa B", "Cat", "img", "addr", "desc");

      await realEstate.addReview(1, 3, "okay", reviewer.address);
      await realEstate.addReview(2, 5, "amazing", reviewer.address);

      expect(await realEstate.getHighestRatedProduct()).to.equal(2n);
    });

    it("correctly averages multiple reviews on the same property", async function () {
      await realEstate.listProperty(seller.address, toWei(10), "Villa A", "Cat", "img", "addr", "desc");
      await realEstate.listProperty(seller.address, toWei(10), "Villa B", "Cat", "img", "addr", "desc");

      await realEstate.addReview(1, 5, "great", reviewer.address);
      await realEstate.addReview(1, 5, "great again", stranger.address);
      await realEstate.addReview(2, 4, "good", reviewer.address);

      // property 1 avg = 5, property 2 avg = 4
      expect(await realEstate.getHighestRatedProduct()).to.equal(1n);
    });
  });
});