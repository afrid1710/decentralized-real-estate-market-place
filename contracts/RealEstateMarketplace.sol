// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RealEstateMarketplace is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _propertyIds;

    struct Property {
        uint256 id;
        string title;
        string location;
        uint256 price;
        address payable owner;
        bool forSale;
    }

    mapping(uint256 => Property) public properties;

    event PropertyListed(uint256 propertyId, string title, string location, uint256 price);
    event PropertySold(uint256 propertyId, address buyer, uint256 price);
    event PropertyTransferred(uint256 propertyId, address from, address to);

    constructor() ERC721("RealEstateToken", "RET") {}

    function mintProperty(string memory _title, string memory _location, uint256 _price) public {
        _propertyIds.increment();
        uint256 newPropertyId = _propertyIds.current();

        _mint(msg.sender, newPropertyId);

        properties[newPropertyId] = Property({
            id: newPropertyId,
            title: _title,
            location: _location,
            price: _price,
            owner: payable(msg.sender),
            forSale: true
        });

        emit PropertyListed(newPropertyId, _title, _location, _price);
    }

    function listPropertyForSale(uint256 _propertyId, uint256 _price) public {
        require(ownerOf(_propertyId) == msg.sender, "You are not the owner");
        Property storage property = properties[_propertyId];
        property.price = _price;
        property.forSale = true;
    }

    function buyProperty(uint256 _propertyId) public payable {
        Property storage property = properties[_propertyId];
        require(property.forSale == true, "Property is not for sale");
        require(msg.value >= property.price, "Insufficient funds");

        address payable seller = property.owner;
        property.owner = payable(msg.sender);
        property.forSale = false;

        _transfer(seller, msg.sender, _propertyId);
        seller.transfer(msg.value);

        emit PropertySold(_propertyId, msg.sender, property.price);
        emit PropertyTransferred(_propertyId, seller, msg.sender);
    }

    function getPropertyDetails(uint256 _propertyId) public view returns (Property memory) {
        return properties[_propertyId];
    }

    // Getter function for _propertyIds
    function getTotalProperties() public view returns (uint256) {
        return _propertyIds.current();
    }
}
