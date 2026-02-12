import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

BRONZE_ID = 755306293
SILVER_ID = 755306303

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

pk = mnemonic.to_private_key(os.getenv("MNEMONIC"))
addr = account.address_from_private_key(pk)
params = client.suggested_params()

# Opt-in Bronze
txn1 = AssetOptInTxn(addr, params, BRONZE_ID)
signed1 = txn1.sign(pk)
txid1 = client.send_transaction(signed1)
wait_for_confirmation(client, txid1, 4)
print("✅ Opted into Bronze Pass")

# Opt-in Silver
txn2 = AssetOptInTxn(addr, params, SILVER_ID)
signed2 = txn2.sign(pk)
txid2 = client.send_transaction(signed2)
wait_for_confirmation(client, txid2, 4)
print("✅ Opted into Silver Pass")
