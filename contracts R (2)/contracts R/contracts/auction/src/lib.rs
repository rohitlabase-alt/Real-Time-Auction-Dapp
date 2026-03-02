#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Owner,
    ItemName,
    HighestBidder,
    HighestBid,
    EndTime,
    IsActive,
}

#[contract]
pub struct AuctionContract;

#[contractimpl]
impl AuctionContract {
    /// Initialize the auction
    pub fn initialize(
        env: Env,
        owner: Address,
        item_name: String,
        starting_price: u64,
        duration_seconds: u64,
    ) {
        owner.require_auth();
        assert!(
            !env.storage().instance().has(&DataKey::Owner),
            "Auction is already initialized"
        );

        let end_time = env.ledger().timestamp() + duration_seconds;

        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::ItemName, &item_name);
        env.storage()
            .instance()
            .set(&DataKey::HighestBid, &starting_price);
        env.storage().instance().set(&DataKey::EndTime, &end_time);
        env.storage().instance().set(&DataKey::IsActive, &true);

        env.events()
            .publish((Symbol::new(&env, "auction_initialized"), item_name), starting_price);
    }

    /// Place a bid
    pub fn bid(env: Env, bidder: Address, bid_amount: u64) {
        bidder.require_auth();

        // Check if auction is active
        let is_active: bool = env
            .storage()
            .instance()
            .get(&DataKey::IsActive)
            .unwrap_or(false);
        assert!(is_active, "Auction is not active");

        // Check time
        let end_time: u64 = env.storage().instance().get(&DataKey::EndTime).unwrap();
        assert!(
            env.ledger().timestamp() < end_time,
            "Auction has already ended"
        );

        // Check bid amount
        let highest_bid: u64 = env.storage().instance().get(&DataKey::HighestBid).unwrap();
        assert!(
            bid_amount > highest_bid,
            "Bid amount must be higher than current highest bid"
        );

        // Accept bid
        env.storage()
            .instance()
            .set(&DataKey::HighestBidder, &bidder);
        env.storage().instance().set(&DataKey::HighestBid, &bid_amount);

        // Publish event for real-time update
        env.events()
            .publish((Symbol::new(&env, "new_bid"), bidder), bid_amount);
    }

    /// End the auction
    pub fn end_auction(env: Env) {
        let is_active: bool = env
            .storage()
            .instance()
            .get(&DataKey::IsActive)
            .unwrap_or(false);
        assert!(is_active, "Auction is already ended or not initialized");

        let end_time: u64 = env.storage().instance().get(&DataKey::EndTime).unwrap();
        assert!(
            env.ledger().timestamp() >= end_time,
            "Auction time has not expired yet"
        );

        env.storage().instance().set(&DataKey::IsActive, &false);

        let highest_bidder: Option<Address> = env.storage().instance().get(&DataKey::HighestBidder);
        let highest_bid: u64 = env.storage().instance().get(&DataKey::HighestBid).unwrap();

        env.events()
            .publish((Symbol::new(&env, "auction_ended"), highest_bidder), highest_bid);
    }

    /// View getters
    pub fn get_highest_bid(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::HighestBid).unwrap_or(0)
    }

    pub fn get_highest_bidder(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::HighestBidder)
    }

    pub fn get_end_time(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::EndTime).unwrap_or(0)
    }

    pub fn is_active(env: Env) -> bool {
        env.storage().instance().get(&DataKey::IsActive).unwrap_or(false)
    }
}
