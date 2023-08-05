"""Modified Teia Community marketplace contract.

This version corrects several small bugs from the v2 H=N marketplace contract
and adds the possibility to trade different kinds of FA2 tokens.

Modified for the new sintax of SmartPy v0.17 and also working as a coop factory.

Error message codes:

- MP_NOT_MANAGER: The operation can only be executed by the contract manager.
- MP_TEZ_TRANSFER: The operation does not accept tez transfers.
- MP_SWAPS_PAUSED: Swaps are currently paused in the marketplace.
- MP_COLLECTS_PAUSED: Collects are currently paused in the marketplace.
- MP_FA2_NOT_ALLOWED: This FA2 token cannot be traded in the marketplace.
- MP_NO_SWAPPED_EDITIONS: At least one edition needs to be swapped.
- MP_WRONG_ROYALTIES: The royalties cannot be higher than 25%.
- MP_WRONG_SWAP_ID: The swap_id doesn't exist.
- MP_IS_SWAP_ISSUER: The collector cannot be the swap issuer.
- MP_WRONG_TEZ_AMOUNT: The provided tez amount must match the edition price.
- MP_SWAP_COLLECTED: All the swapped editions have already been collected.
- MP_NOT_SWAP_ISSUER: Only the swap issuer can cancel the swap.
- MP_WRONG_FEES: The marketplace fees cannot be higher than 25%.
- MP_NO_NEW_MANAGER: The new manager has not been proposed.
- MP_NOT_PROPOSED_MANAGER: The operation can only be executed by the proposed manager.

"""

import smartpy as sp
from templates import fa2_lib as fa2

# Import FA2 template
main = fa2.main
t = fa2.t

@sp.module
def m():

    SWAP_TYPE: type = sp.record(
        # The coop that will receive the funds
        coop_address=sp.address,
        # The user that created the swap
        issuer=sp.address,
        # The token FA2 contract address
        fa2=sp.address,
        # The token id (not necessarily from a OBJKT)
        objkt_id=sp.nat,
        # The number of swapped editions
        objkt_amount=sp.nat,
        # The price of each edition in mutez
        xtz_per_objkt=sp.mutez,
        # The artists royalties in (1000 is 100%)
        royalties=sp.nat,
        # The address that will receive the royalties
        creator=sp.address).layout(
            ("coop_address", ("issuer", ("fa2", ("objkt_id", ("objkt_amount", ("xtz_per_objkt", ("royalties", "creator"))))))))


    class FA2Contract(
        main.Admin,
        main.Nft,
        main.MintNft
    ):
        def __init__(self, administrator):
            main.MintNft.__init__(self)
            main.Nft.__init__(self, sp.big_map(), {}, [])
            main.Admin.__init__(self, administrator)


    class Coop(sp.Contract):
        
        def __init__(self, manager, coop_share):
            self.data.manager = manager
            self.data.members = sp.cast(sp.set(manager), sp.set[sp.address])
            self.data.coop_share = sp.cast(coop_share, sp.nat)
            self.data.proposed_manager = sp.cast(None, sp.option[sp.address])
            

        @sp.private(with_storage="read-only")
        def check_is_manager(self):
            """Checks that the address that called the entry point is the contract
            manager.
    
            """
            return sp.sender == self.data.manager

        @sp.private(with_storage="read-only")
        def check_no_tez_transfer(self):
            """Checks that no tez were transferred in the operation.
    
            """
            assert sp.amount == sp.tez(0), "MP_TEZ_TRANSFER"

        @sp.entrypoint
        def default(self):
            """Distribute funds that are sent to the contract
    
            """
            assert sp.amount > sp.mutez(0)

            N = len(self.data.members)
            amount = sp.split_tokens(sp.amount, 1, N) 
            for member in self.data.members.elements():
                sp.send(member, amount)
            
        # ADD MEMBERS TO THE COOP - only coop admin
        @sp.entrypoint
        def add_member(self, address):

            sp.cast(address, sp.address)
            assert self.check_is_manager(), "MP_NOT_MANAGER"
            assert not self.data.members.contains(address), "ALREADY MEMBER"

            # Check that no tez have been transferred
            self.check_no_tez_transfer()
            
            self.data.members.add(address)

        # DELETE MEMBERS FROM THE COOP - only coop admin and member
        @sp.entrypoint
        def delete_member(self, address):

            sp.cast(address, sp.address)

            # Check that the member belongs to the coop
            assert self.data.members.contains(address), "NOT A MEMBER"
            
            # Only manager or self member can call
            assert self.check_is_manager() or sp.sender == address, "NOT ADMIN OR SELF"
            
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
            
            self.data.members.remove(address)

        @sp.entrypoint
        def change_coop_share(self, new_share):

            sp.cast(new_share, sp.nat)
            assert self.check_is_manager(), "MP_NOT_MANAGER"
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()

            self.data.coop_share = new_share

        @sp.onchain_view()
        def get_members(self):
            """Returns the current members of the coop
    
            Returns
            -------
            List of addresses
    
            """

            return self.data.members

        @sp.onchain_view()
        def get_coop_share(self):
            """Returns the current coop_share
    
            Returns
            -------
            Coop share
    
            """

            return self.data.coop_share

        @sp.entrypoint
        def transfer_manager(self, proposed_manager):
            """Proposes to transfer the marketplace manager to another address.
    
            Parameters
            ----------
            proposed_manager: sp.TAddress
                The address of the proposed new marketplace manager. It could be a
                tz or KT address.
    
            """
            # Define the input parameter data type
            sp.cast(proposed_manager, sp.address)

            # Check that the proposed manager belongs to the coop
            assert self.data.members.contains(proposed_manager), "NOT A MEMBER"
    
            # Check that the manager executed the entry point
            assert self.check_is_manager(), "MP_NOT_MANAGER"
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Set the new proposed manager address
            self.data.proposed_manager = sp.Some(proposed_manager)
    
        @sp.entrypoint
        def accept_manager(self):
            """The proposed manager accepts the marketplace manager
            responsabilities.
    
            """
            # Check that there is a proposed manager
            assert self.data.proposed_manager.is_some(), "MP_NO_NEW_MANAGER"
    
            # Check that the proposed manager executed the entry point
            assert sp.sender == self.data.proposed_manager.unwrap_some(), "MP_NOT_PROPOSED_MANAGER"
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Set the new manager address
            self.data.manager = sp.sender
    
            # Reset the proposed manager value
            self.data.proposed_manager = None
            
            
    class Marketplace(sp.Contract):
        """This contract implements the first version of the Teia Community
        marketplace contract.
    
        """
    
        def __init__(self, manager, metadata, allowed_fa2s, fee):
            """Initializes the contract.
    
            Parameters
            ----------
            manager: sp.TAddress
                The initial marketplace manager address. It could be a tz or KT
                address.
            metadata: sp.TBigMap(sp.TString, sp.TBytes)
                The contract metadata big map. It should contain the IPFS path to
                the contract metadata json file.
            allowed_fa2s: sp.TBigMap(sp.TAddress, sp.TUnit)
                A big map with the list FA2 token addresses that can be traded (or
                not) in the marketplace.
            fee: sp.TNat
                The marketplace fee in per mille units (25 = 2.5%).
    
            """

            # Initialize the contract storage

            # The contract manager. It could be a tz or KT address.
            self.data.manager=sp.cast(manager, sp.address)
            # The contract metadata bigmap.
            # The metadata is stored as a json file in IPFS and the big map
            # contains the IPFS path.
            self.data.metadata=sp.cast(metadata, sp.big_map[sp.string, sp.bytes])
            # The big map with the FA2 token addresses that can be traded in the
            # marketplace.
            self.data.allowed_fa2s=sp.cast(allowed_fa2s, sp.big_map[sp.address, sp.unit])
            # The big map with the swaps information.
            self.data.swaps=sp.cast(sp.big_map(), sp.big_map[sp.nat, SWAP_TYPE])
            # The marketplace fee taken for each collect operation in per mille
            # units (25 = 2.5%).
            self.data.fee=sp.cast(fee, sp.nat)
            # The address that will receive the marketplace fees. It could be
            # a tz or KT address.
            self.data.fee_recipient=sp.cast(manager, sp.address)
            # The swaps bigmap counter. It tracks the total number of swaps in
            # the swaps big map.
            self.data.counter=sp.cast(0, sp.nat)
            # The proposed new manager address. Only set when a new manager is
            # proposed.
            self.data.proposed_manager=sp.cast(None, sp.option[sp.address])
            # A flag that indicates if the marketplace swaps are paused or not.
            self.data.swaps_paused=sp.cast(False, sp.bool)
            # A flag that indicates if the marketplace collects are paused or not.
            self.data.collects_paused=sp.cast(False, sp.bool)


        @sp.private(with_storage="read-only")
        def check_is_manager(self):
            """Checks that the address that called the entry point is the contract
            manager.
    
            """
            assert sp.sender == self.data.manager, "MP_NOT_MANAGER"

        @sp.private(with_storage="read-only")
        def check_no_tez_transfer(self):
            """Checks that no tez were transferred in the operation.
    
            """
            assert sp.amount == sp.tez(0), "MP_TEZ_TRANSFER"


        @sp.entrypoint
        def create_coop(self, coop_share):

            sp.cast(coop_share, sp.nat)
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()

            s = sp.record(
                manager = sp.sender, 
                proposed_manager = None,
                members = sp.cast(sp.set(), sp.set[sp.address]),
                coop_share = coop_share
            )

            _ = sp.create_contract(Coop, None, sp.tez(0), s)
            

        @sp.entrypoint
        def swap(self, params):
            """Swaps several editions of a token for a fixed price.
    
            Note that for this operation to work, the marketplace contract should
            be added before as an operator of the token by the swap issuer. 
            It's recommended to remove the marketplace operator rights after
            calling this entry point.
    
            Parameters
            ----------
            params: sp.TRecord
                The swap parameters:
                - fa2: the FA2 token contract address.
                - objkt_id: the OBJKT id.
                - objkt_amount: the number of editions to swap.
                - xtz_per_objkt: the price per edition in mutez.
                - royalties: the artist/creator royalties in per mille units.
                - creator: the artist/creator address. It could be a KT address for
                  artists collaborations.
    
            """
            # Define the input parameter data type
            sp.cast(params, sp.record(
                coop_address=sp.address,
                fa2_address=sp.address,
                objkt_id=sp.nat,
                objkt_amount=sp.nat,
                xtz_per_objkt=sp.mutez,
                royalties=sp.nat,
                creator=sp.address).layout(
                    ("coop_address", ("fa2_address", ("objkt_id", ("objkt_amount", ("xtz_per_objkt", ("royalties", "creator"))))))))
    
            # Check that swaps are not paused
            assert not self.data.swaps_paused, "MP_SWAPS_PAUSED"
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Check that the token is one of the allowed tokens to trade
            assert self.data.allowed_fa2s.contains(params.fa2_address), "MP_FA2_NOT_ALLOWED"
    
            # Check that at least one edition will be swapped
            assert params.objkt_amount > 0, "MP_NO_SWAPPED_EDITIONS"
    
            # Check that the royalties are within the expected limits
            assert params.royalties <= 250, "MP_WRONG_ROYALTIES"

            # Check that the swap issuer belongs to the params.coop
            members = sp.view("get_members", params.coop_address, (), sp.set[sp.address]).unwrap_some()
            assert members.contains(sp.sender), "NOT A MEMBER"
            
            # Transfer all the editions to the marketplace account
            c = sp.contract(t.transfer_params, params.fa2_address, entrypoint="transfer").unwrap_some()
            sp.transfer(
                [sp.record(
                    from_=sp.sender,
                    txs=[sp.record(
                        to_=sp.self_address(),
                        token_id=params.objkt_id,
                        amount=params.objkt_amount)])],
                sp.mutez(0), c)
 
            
            # Update the swaps bigmap with the new swap information
            self.data.swaps[self.data.counter] = sp.record(
                coop_address=params.coop_address,
                issuer=sp.sender,
                fa2=params.fa2_address,
                objkt_id=params.objkt_id,
                objkt_amount=params.objkt_amount,
                xtz_per_objkt=params.xtz_per_objkt,
                royalties=params.royalties,
                creator=params.creator)
    
            # Increase the swaps counter
            self.data.counter += 1
    
        @sp.entrypoint
        def collect(self, swap_id):
            """Collects one edition of a token that has already been swapped.
    
            Parameters
            ----------
            swap_id: sp.TNat
                The swap id. It refers to the swaps big map key containing the swap
                parameters.
    
            """
            # Define the input parameter data type
            sp.cast(swap_id, sp.nat)
    
            # Check that collects are not paused
            assert not self.data.collects_paused, "MP_COLLECTS_PAUSED"
    
            # Check that the swap id is present in the swaps big map
            assert self.data.swaps.contains(swap_id), "MP_WRONG_SWAP_ID"
    
            # Check that the collector is not the creator of the swap
            swap = self.data.swaps[swap_id]
            assert sp.sender != swap.issuer, "MP_IS_SWAP_ISSUER"
    
            # Check that the provided tez amount is exactly the edition price
            assert sp.amount == swap.xtz_per_objkt, "MP_WRONG_TEZ_AMOUNT"
    
            # Check that there is at least one edition available to collect
            assert swap.objkt_amount > 0, "MP_SWAP_COLLECTED"
    
            # Handle tez tranfers if the edition price is not zero
            if swap.xtz_per_objkt != sp.tez(0):
                # Send the royalties to the NFT creator
                royalties_amount = sp.split_tokens(
                        swap.xtz_per_objkt, swap.royalties, 1000)
    
                if royalties_amount > sp.mutez(0):
                    sp.send(swap.creator, royalties_amount)
    
                # Send the management fees
                fee_amount = sp.split_tokens(
                        swap.xtz_per_objkt, self.data.fee, 1000)
    
                if fee_amount > sp.mutez(0):
                    sp.send(self.data.fee_recipient, fee_amount)

                # Send the coop fee
                coop_share = sp.view("get_coop_share", swap.coop_address, (), sp.nat).unwrap_some()
                coop_amount = sp.split_tokens(
                        swap.xtz_per_objkt, coop_share, 1000)

                if fee_amount > sp.mutez(0):
                    sp.send(swap.coop_address, coop_amount)
                    
                # Send what is left to the swap issuer
                sp.send(swap.issuer, sp.amount - royalties_amount - fee_amount - coop_amount)
    
            # Transfer the token edition to the collector
            c = sp.contract(t.transfer_params, swap.fa2, entrypoint="transfer").unwrap_some()
            sp.transfer(
                [sp.record(
                    from_=sp.self_address(),
                    txs=[sp.record(
                        to_=sp.sender,
                        token_id=swap.objkt_id,
                        amount=1)])],
                sp.mutez(0), c)
    
            # Update the number of editions available in the swaps big map
            self.data.swaps[swap_id].objkt_amount = sp.as_nat(swap.objkt_amount - 1)
    
        @sp.entrypoint
        def cancel_swap(self, swap_id):
            """Cancels an existing swap.
    
            Parameters
            ----------
            swap_id: sp.TNat
                The swap id. It refers to the swaps big map key containing the swap
                parameters.
    
            """
            # Define the input parameter data type
            sp.cast(swap_id, sp.nat)
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Check that the swap id is present in the swaps big map
            assert self.data.swaps.contains(swap_id), "MP_WRONG_SWAP_ID" 
    
            # Check that the swap issuer is cancelling the swap
            swap = self.data.swaps[swap_id]
            assert sp.sender == swap.issuer, "MP_NOT_SWAP_ISSUER"
    
            # Check that there is at least one swapped edition
            assert swap.objkt_amount > 0, "MP_SWAP_COLLECTED" 
    
            # Transfer the remaining token editions back to the owner
            c = sp.contract(t.transfer_params, swap.fa2, entrypoint="transfer").unwrap_some()
            sp.transfer(
                [sp.record(
                    from_=sp.self_address(),
                    txs=[sp.record(
                        to_=sp.sender,
                        token_id=swap.objkt_id,
                        amount=swap.objkt_amount)])],
                sp.mutez(0), c)
    
            # Delete the swap entry in the the swaps big map
            del self.data.swaps[swap_id]
    
        @sp.entrypoint
        def update_fee(self, new_fee):
            """Updates the marketplace management fees.
    
            Parameters
            ----------
            new_fee: sp.TNat
                The new marketplace fee in per mille units (25 = 2.5%).
    
            """
            # Define the input parameter data type
            sp.cast(new_fee, sp.nat)
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Check that the new fee is not larger than 25%
            assert new_fee <= 250, "MP_WRONG_FEES"
    
            # Set the new management fee
            self.data.fee = new_fee
    
        @sp.entrypoint
        def update_fee_recipient(self, new_fee_recipient):
            """Updates the marketplace management fee recipient address.
    
            Parameters
            ----------
            new_fee_recipient: sp.TAddress
                The new address that will receive the marketplace fees. It could be
                a tz or KT address.
    
            """
            # Define the input parameter data type
            sp.cast(new_fee_recipient, sp.address)
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Set the new management fee recipient address
            self.data.fee_recipient = new_fee_recipient
    
        @sp.entrypoint
        def transfer_manager(self, proposed_manager):
            """Proposes to transfer the marketplace manager to another address.
    
            Parameters
            ----------
            proposed_manager: sp.TAddress
                The address of the proposed new marketplace manager. It could be a
                tz or KT address.
    
            """
            # Define the input parameter data type
            sp.cast(proposed_manager, sp.address)
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Set the new proposed manager address
            self.data.proposed_manager = sp.Some(proposed_manager)
    
        @sp.entrypoint
        def accept_manager(self):
            """The proposed manager accepts the marketplace manager
            responsabilities.
    
            """
            # Check that there is a proposed manager
            assert self.data.proposed_manager.is_some(), "MP_NO_NEW_MANAGER"
    
            # Check that the proposed manager executed the entry point
            assert sp.sender == self.data.proposed_manager.unwrap_some(), "MP_NOT_PROPOSED_MANAGER"
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Set the new manager address
            self.data.manager = sp.sender
    
            # Reset the proposed manager value
            self.data.proposed_manager = None
    
        @sp.entrypoint
        def update_metadata(self, params):
            """Updates the contract metadata.
    
            Parameters
            ----------
            params: sp.TRecord
                The updated metadata parameters:
                - key: the metadata big map key to update.
                - value: the IPFS path to the json file with the updated metadata.
    
            """
            # Define the input parameter data type
            sp.cast(params, sp.record(
                key=sp.string,
                value=sp.bytes).layout(("key", "value")))
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Update the contract metadata
            self.data.metadata[params.key] = params.value
    
        @sp.entrypoint
        def add_fa2(self, fa2):
            """Adds a new FA2 token address to the list of tradable tokens.
    
            Parameters
            ----------
            fa2: sp.TAddress
                The FA2 token contract address to add.
    
            """
            # Define the input parameter data type
            sp.cast(fa2, sp.address)
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Add the new FA2 token address
            self.data.allowed_fa2s[fa2] = ()
    
        @sp.entrypoint
        def remove_fa2(self, fa2):
            """Removes one of the tradable FA2 token address.
    
            Parameters
            ----------
            fa2: sp.TAddress
                The FA2 token contract address to remove.
    
            """
            # Define the input parameter data type
            sp.cast(fa2, sp.address)
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Remove the FA2 token address from the list of allowed FA2 tokens
            del self.data.allowed_fa2s[fa2]
    
        @sp.entrypoint
        def set_pause_swaps(self, pause):
            """Pause or not the swaps.
    
            Parameters
            ----------
            pause: sp.TBool
                If true, swaps will be paused in the marketplace. False will allow
                to create new swaps again.
    
            """
            # Define the input parameter data type
            sp.cast(pause, sp.bool)
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Pause or unpause the swaps
            self.data.swaps_paused = pause
    
        @sp.entrypoint
        def set_pause_collects(self, pause):
            """Pause or not the collects.
    
            Parameters
            ----------
            pause: sp.TBool
                If true, collects will be paused in the marketplace. False will
                allow to collect again.
    
            """
            # Define the input parameter data type
            sp.cast(pause, sp.bool)
    
            # Check that the manager executed the entry point
            self.check_is_manager()
    
            # Check that no tez have been transferred
            self.check_no_tez_transfer()
    
            # Pause or unpause the collects
            self.data.collects_paused = pause
    
        @sp.onchain_view()
        def get_manager(self):
            """Returns the marketplace manager address.
    
            Returns
            -------
            sp.TAddress
                The marketplace manager address.
    
            """
            return self.data.manager
    
        @sp.onchain_view()
        def is_allowed_fa2(self, fa2):
            """Checks if a given FA2 token contract can be traded in the
            marketplace.
    
            Parameters
            ----------
            fa2: sp.TAddress
                The FA2 token contract address.
    
            Returns
            -------
            sp.TBool
                True, if the token can be traded in the marketplace.
    
            """
            # Define the input parameter data type
            sp.cast(fa2, sp.address)
    
            # Return if it can be traded or not
            return self.data.allowed_fa2s.contains(fa2)
    
        @sp.onchain_view()
        def has_swap(self, swap_id):
            """Check if a given swap id is present in the swaps big map.
    
            Parameters
            ----------
            swap_id: sp.TNat
                The swap id.
    
            Returns
            -------
            sp.TBool
                True, if there is a swap with the provided id.
    
            """
            # Define the input parameter data type
            sp.cast(swap_id, sp.nat)
    
            # Return True if the swap id is present in the swaps big map
            return self.data.swaps.contains(swap_id)
    
        @sp.onchain_view()
        def get_swap(self, swap_id):
            """Returns the complete information from a given swap id.
    
            Parameters
            ----------
            swap_id: sp.TNat
                The swap id.
    
            Returns
            -------
            sp.TRecord
                The swap parameters:
                - issuer: the swap issuer address.
                - fa2: the FA2 token contract address.
                - objkt_id: the OBJKT id.
                - objkt_amount: the number of currently swapped editions.
                - xtz_per_objkt: the price per edition in mutez.
                - royalties: the artist/creator royalties in per mille units.
                - creator: the artist/creator address.
    
            """
            # Define the input parameter data type
            sp.cast(swap_id, sp.nat)
    
            # Check that the swap id is present in the swaps big map
            assert self.data.swaps.contains(swap_id), "MP_WRONG_SWAP_ID" 
    
            # Return the swap information
            return self.data.swaps[swap_id]
    
        @sp.onchain_view()
        def get_swaps_counter(self):
            """Returns the swaps counter.
    
            Returns
            -------
            sp.TNat
                The total number of swaps.
    
            """
            return self.data.counter
    
        @sp.onchain_view()
        def get_fee(self):
            """Returns the marketplace fee.
    
            Returns
            -------
            sp.TNat
                The marketplace fee in per mille units.
    
            """
            return self.data.fee
    
        @sp.onchain_view()
        def get_fee_recipient(self):
            """Returns the marketplace fee recipient address.
    
            Returns
            -------
            sp.TAddress
                The address that receives the marketplace fees.
    
            """
            return self.data.fee_recipient


@sp.add_test(name="Marketplace")
def test():

    fa2_admin = sp.test_account("fa2_admin")
    factory_admin = sp.test_account("factory_admin")

    #sc = sp.test_scenario(m)
    sc = sp.test_scenario([fa2.t, fa2.main, m])
    
    sc.h2("Initialize one FA2")
    fa2_contract1 = m.FA2Contract(fa2_admin.address)
    sc += fa2_contract1
    
    sc.h2("Initialize market")
    metadata = sp.big_map({"": sp.pack("ipfs://Qm")})
    allowed_fa2s = sp.big_map({fa2_contract1.address: ()})
    fee = 25
    market = m.Marketplace(factory_admin.address, metadata, allowed_fa2s, fee)
    sc += market

    
