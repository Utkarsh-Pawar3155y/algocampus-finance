import os
from algosdk import account, mnemonic, logic
from algosdk.v2client import algod
from algosdk.transaction import *
from dotenv import load_dotenv

load_dotenv(".env")

APP_ID = 755299523
AMOUNT = 1_000_000  # 1 Algo (microAlgos)

client = algod.AlgodClient(
    os.getenv("ALGOD_TOKEN"),
    os.getenv("ALGOD_ADDRESS")
)

private_key = mnemonic.to_private_key(os.getenv("MNEMONIC"))
sender = account.address_from_private_key(private_key)

params = client.suggested_params()

# App call transaction
app_call = ApplicationNoOpTxn(
    sender=sender,
    sp=params,
    index=APP_ID,
    app_args=[b"donate"]
)

# Payment transaction
pay = PaymentTxn(
    sender=sender,
    sp=params,
    receiver=logic.get_application_address(APP_ID),
    amt=AMOUNT
)

# Group transactions
gid = calculate_group_id([app_call, pay])
app_call.group = gid
pay.group = gid

signed_app = app_call.sign(private_key)
signed_pay = pay.sign(private_key)

txid = client.send_transactions([signed_app, signed_pay])
print("DONATION TXID:", txid)

wait_for_confirmation(client, txid, 4)
print("✅ Donation successful")
