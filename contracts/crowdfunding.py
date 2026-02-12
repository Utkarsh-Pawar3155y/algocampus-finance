from pyteal import *

def approval_program():
    # ---------- Global State ----------
    goal = Bytes("GOAL")
    deadline = Bytes("DEADLINE")
    raised = Bytes("RAISED")
    founder = Bytes("FOUNDER")
    claimed = Bytes("CLAIMED")

    # ---------- Local State ----------
    contribution = Bytes("CONTRIB")

    # ---------- On Create ----------
    on_create = Seq(
        Assert(Txn.application_args.length() == Int(2)),
        App.globalPut(goal, Btoi(Txn.application_args[0])),
        App.globalPut(deadline, Btoi(Txn.application_args[1])),
        App.globalPut(raised, Int(0)),
        App.globalPut(claimed, Int(0)),
        App.globalPut(founder, Txn.sender()),
        Approve()
    )

    # ---------- Opt In ----------
    on_opt_in = Seq(
        App.localPut(Txn.sender(), contribution, Int(0)),
        Approve()
    )

    # ---------- Donate ----------
    on_donate = Seq(
        Assert(Global.group_size() == Int(2)),
        Assert(Global.latest_timestamp() < App.globalGet(deadline)),

        Assert(Gtxn[1].type_enum() == TxnType.Payment),
        Assert(Gtxn[1].receiver() == Global.current_application_address()),
        Assert(Gtxn[1].amount() > Int(0)),

        App.globalPut(
            raised,
            App.globalGet(raised) + Gtxn[1].amount()
        ),

        App.localPut(
            Txn.sender(),
            contribution,
            App.localGet(Txn.sender(), contribution) + Gtxn[1].amount()
        ),

        Approve()
    )

    # ---------- Claim ----------
    on_claim = Seq(
        Assert(Txn.sender() == App.globalGet(founder)),
        Assert(Global.latest_timestamp() >= App.globalGet(deadline)),
        Assert(App.globalGet(raised) >= App.globalGet(goal)),
        Assert(App.globalGet(claimed) == Int(0)),

        App.globalPut(claimed, Int(1)),

        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: App.globalGet(founder),
            TxnField.amount: App.globalGet(raised),
        }),
        InnerTxnBuilder.Submit(),

        Approve()
    )

    # ---------- Refund ----------
    on_refund = Seq(
        Assert(Global.latest_timestamp() >= App.globalGet(deadline)),
        Assert(App.globalGet(raised) < App.globalGet(goal)),
        Assert(App.localGet(Txn.sender(), contribution) > Int(0)),

        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.receiver: Txn.sender(),
            TxnField.amount: App.localGet(Txn.sender(), contribution),
        }),
        InnerTxnBuilder.Submit(),

        App.localPut(Txn.sender(), contribution, Int(0)),

        Approve()
    )

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.OptIn, on_opt_in],
        [Txn.application_args[0] == Bytes("donate"), on_donate],
        [Txn.application_args[0] == Bytes("claim"), on_claim],
        [Txn.application_args[0] == Bytes("refund"), on_refund],
    )

    return program


def clear_state_program():
    return Approve()


if __name__ == "__main__":
    print(compileTeal(approval_program(), Mode.Application, version=6))
    print(compileTeal(clear_state_program(), Mode.Application, version=6))
