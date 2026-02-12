import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

BRONZE_ID = 755306293  # <-- bronze ASA ID

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

pk = mnemonic.to_private_key(os.getenv("MNEMONIC"))
addr = account.address_from_private_key(pk)
params = client.suggested_params()

txn = AssetTransferTxn(
    sender=addr,
    sp=params,
    receiver=addr,
    amt=1,
    index=BRONZE_ID
)

signed = txn.sign(pk)
txid = client.send_transaction(signed)
wait_for_confirmation(client, txid, 4)

print("✅ Bronze Pass minted to wallet")
