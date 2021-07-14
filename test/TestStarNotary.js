const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    const tokenId = 1;
    const instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 2;
    const starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 3;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    const balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    const value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    const value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    const value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    assert.equal(await instance.name.call(), 'STARS')
    assert.equal(await instance.symbol.call(), 'STA')
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();
    const tokenId1 = 9;
    const tokenId2 = 10;
    
    // 1. create 2 Stars with different tokenId
    await instance.createStar('Awesome Star', tokenId1, { from: accounts[0] })
    await instance.createStar('Awesome Star to exchange', tokenId2, { from: accounts[1] })
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2, { from: accounts[0] })
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(tokenId1), accounts[1]);
    assert.equal(await instance.ownerOf.call(tokenId2), accounts[0]);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    const instance = await StarNotary.deployed();
    const tokenId = 11;
    
    await instance.createStar('Awesome Star', tokenId, { from: accounts[0] })
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[1], tokenId,  { from: accounts[0] })
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(tokenId), accounts[1]);

});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();
    const tokenId = 12;
    
    // 1. create a Star with different tokenId
    await instance.createStar('Awesome Star', tokenId, { from: accounts[0] })
    // 2. Call your method lookUptokenIdToStarInfo
    const starName = await instance.lookUptokenIdToStarInfo(tokenId)
    // 3. Verify if you Star name is the same
    assert.equal('Awesome Star', starName)
});