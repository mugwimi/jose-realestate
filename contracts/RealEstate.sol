// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract RealEstate {

    struct Property {
        uint256 productID;
        address owner;
        uint256 price;
        string propertyTitle;
        string category;
        string images;
        string propertyAddress;
        string description;
        address[] reviewers;
        string[] reviews;
    }

    mapping(uint256 => Property) private properties;
    uint256 public propertyIndex;

    event propertyListed(uint256 indexed id, address indexed owner, uint256 price);
    event propertySold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);
    event propertyResold(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 price);

    struct Review {
        address reviewer;
        uint256 productId;
        uint256 rating;
        string comment;
        uint256 likes;
    }

    struct Product {
        uint256 productId;
        uint256 totalRating;
        uint256 numReviews;
    }

    mapping(uint256 => Review[]) private reviews;
    mapping(address => uint256[]) private userReviews;
    mapping(uint256 => Product) private products;

    uint256 public reviewsCounter;

    event ReviewAdded(uint256 indexed productId, address indexed reviewer, uint256 rating, string comment);
    event ReviewLiked(uint256 indexed productId, uint256 indexed reviewIndex, address indexed liker, uint256 likes);

    function listProperty(
        address owner,
        uint256 price,
        string memory _propertyTitle,
        string memory _category,
        string memory _images,
        string memory _propertyAddress,
        string memory _description
    ) external returns (uint256) {
        require(price > 0, "price must be greater than 0");
        propertyIndex++;
        uint256 productId = propertyIndex;

        Property storage property = properties[productId];
        property.productID = productId;
        property.owner = owner;
        property.price = price;
        property.propertyTitle = _propertyTitle;
        property.category = _category;
        property.images = _images;
        property.propertyAddress = _propertyAddress;
        property.description = _description;

        emit propertyListed(productId, owner, price);
        return productId;
    }

    function updateProperty(
        address owner,
        uint256 productId,
        string memory _propertyTitle,
        string memory _category,
        string memory _images,
        string memory _propertyAddress,
        string memory _description
    ) external returns (uint256) {
        Property storage property = properties[productId];
        require(property.owner == owner, "you are not the owner");
        property.propertyTitle = _propertyTitle;
        property.category = _category;
        property.images = _images;
        property.propertyAddress = _propertyAddress;
        property.description = _description;
        return productId;
    }

    function updatePrice(address owner, uint256 productId, uint256 price) external returns (string memory) {
        Property storage property = properties[productId];
        require(property.owner == owner, "you are not the owner");
        require(price > 0, "price must be greater than 0");
        property.price = price;
        return "your property price is updated";
    }

    function buyProperty(uint256 id, address buyer) external payable {
        Property storage property = properties[id];
        require(property.owner != address(0), "property does not exist");
        require(property.owner != buyer, "owner cannot buy own property");
        require(msg.value >= property.price, "insufficient funds");

        address oldOwner = property.owner;

        (bool sent, ) = payable(oldOwner).call{value: msg.value}("");
        require(sent, "payment to seller failed");

        property.owner = buyer;

        if (propertyIndex > 0 && id != 0) {
            emit propertyResold(id, oldOwner, buyer, msg.value);
        }
        emit propertySold(id, oldOwner, buyer, msg.value);
    }

    function getAllProperties() public view returns (Property[] memory) {
        uint256 itemCount = propertyIndex;
        Property[] memory items = new Property[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i + 1;
            items[i] = properties[currentId];
        }
        return items;
    }

    function getProperty(uint256 id) external view returns (
        uint256,
        address,
        uint256,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory
    ) {
        Property memory property = properties[id];
        return (
            property.productID,
            property.owner,
            property.price,
            property.propertyTitle,
            property.category,
            property.images,
            property.propertyAddress,
            property.description
        );
    }

    function getUserProperties(address user) external view returns (Property[] memory) {
        uint256 totalItemCount = propertyIndex;
        uint256 itemCount = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (properties[i + 1].owner == user) {
                itemCount += 1;
            }
        }

        Property[] memory items = new Property[](itemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (properties[i + 1].owner == user) {
                items[currentIndex] = properties[i + 1];
                currentIndex += 1;
            }
        }
        return items;
    }

    function addReview(uint256 productId, uint256 rating, string calldata comment, address user) external {
        require(rating >= 1 && rating <= 5, "ratings must be between one and five");
        require(properties[productId].owner != address(0), "property does not exist");

        Property storage property = properties[productId];
        property.reviewers.push(user);
        property.reviews.push(comment);

        reviews[productId].push(Review(user, productId, rating, comment, 0));
        userReviews[user].push(productId);
        products[productId].productId = productId;
        products[productId].totalRating += rating;
        products[productId].numReviews++;

        emit ReviewAdded(productId, user, rating, comment);
        reviewsCounter++;
    }

    function getProductReviews(uint256 productId) external view returns (Review[] memory) {
        return reviews[productId];
    }

    function getUserReviews(address user) external view returns (Review[] memory) {
        uint256 totalReviews = userReviews[user].length;
        Review[] memory userProductReviews = new Review[](totalReviews);

        for (uint256 i = 0; i < totalReviews; i++) {
            uint256 productId = userReviews[user][i];
            Review[] memory productReviews = reviews[productId];

            for (uint256 j = 0; j < productReviews.length; j++) {
                if (productReviews[j].reviewer == user) {
                    userProductReviews[i] = productReviews[j];
                    break;
                }
            }
        }
        return userProductReviews;
    }

    function likeReview(uint256 productId, uint256 reviewIndex, address user) external {
        require(reviewIndex < reviews[productId].length, "invalid review index");
        Review storage review = reviews[productId][reviewIndex];
        review.likes++;
        emit ReviewLiked(productId, reviewIndex, user, review.likes);
    }

    function getHighestRatedProduct() external view returns (uint256) {
        uint256 highestRating = 0;
        uint256 highestRatedProductId = 0;

        for (uint256 i = 1; i <= propertyIndex; i++) {
            if (products[i].numReviews > 0) {
                uint256 avgRating = products[i].totalRating / products[i].numReviews;
                if (avgRating > highestRating) {
                    highestRating = avgRating;
                    highestRatedProductId = i;
                }
            }
        }
        return highestRatedProductId;
    }
}