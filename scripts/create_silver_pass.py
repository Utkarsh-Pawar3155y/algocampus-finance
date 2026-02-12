import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

pk = mnemonic.to_private_key(os.getenv("MNEMONIC"))
creator = account.address_from_private_key(pk)

params = client.suggested_params()

txn = AssetCreateTxn(
    sender=creator,
    sp=params,
    total=1,
    decimals=0,
    default_frozen=True,
    unit_name="SILVER",
    asset_name="Campus Silver Pass",
    manager=creator,
    freeze=creator,
    clawback=None,
    reserve=None
)

signed = txn.sign(pk)
txid = client.send_transaction(signed)
result = wait_for_confirmation(client, txid, 4)

SILVER_ID = result["asset-index"]
print("✅ Silver Pass ASA ID:", SILVER_ID)
