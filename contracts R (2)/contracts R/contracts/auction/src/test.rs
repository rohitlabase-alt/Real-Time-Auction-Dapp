#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};

#[test]
fn test_auction_flow() {
    let env = Env::default();
    let contract_id = env.register_contract(None, AuctionContract);
    let client = AuctionContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let bidder1 = Address::generate(&env);
    let bidder2 = Address::generate(&env);

    let item_name = String::from_str(&env, "Rare NFT");
    let initial_price = 100;
    let duration = 3600; // 1 hour

    // Initialize
    client.initialize(&owner, &item_name, &initial_price, &duration);
    
    // Check initial state
    assert_eq!(client.is_active(), true);
    assert_eq!(client.get_highest_bid(), 100);

    // Bidder 1 places a bid
    env.mock_all_auths();
    client.bid(&bidder1, &150);
    assert_eq!(client.get_highest_bid(), 150);
    assert_eq!(client.get_highest_bidder(), Some(bidder1.clone()));

    // Bidder 2 places a higher bid
    client.bid(&bidder2, &200);
    assert_eq!(client.get_highest_bid(), 200);
    assert_eq!(client.get_highest_bidder(), Some(bidder2.clone()));

    // Time passes
    env.ledger().set_timestamp(env.ledger().timestamp() + 4000);

    // End auction
    client.end_auction();
    assert_eq!(client.is_active(), false);
}
