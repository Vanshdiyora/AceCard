import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { resetPassword } from "../slice";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

export default function ResetPasswordSection() {
    const dispatch = useAppDispatch();
    const saving = useAppSelector((s) => s.settings.account.saving);
    const apiError = useAppSelector((s) => s.settings.account.error);

    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const [resultOpen, setResultOpen] = useState(false);
    const [resultSuccess, setResultSuccess] = useState(false);
    const [resultMessage, setResultMessage] = useState("");

    const submit = () => {
        setLocalError(null);

        if (!oldPass || !newPass || !confirm) {
            setLocalError("All fields are required.");
            return;
        }

        if (newPass.length < 8) {
            setLocalError("New password must be at least 8 characters.");
            return;
        }

        if (newPass !== confirm) {
            setLocalError("New passwords do not match.");
            return;
        }

        if (oldPass === newPass) {
            setLocalError("New password must be different from old password.");
            return;
        }

        dispatch(resetPassword({ old_password: oldPass, new_password: newPass }))
            .unwrap()
            .then(() => {
                setOldPass("");
                setNewPass("");
                setConfirm("");
                setResultSuccess(true);
                setResultMessage("Your password has been updated successfully.");
                setResultOpen(true);
            })
            .catch((err) => {
                const msg =
                    typeof err === "string"
                        ? err
                        : err?.error || err?.message || apiError || "Password update failed.";

                setResultSuccess(false);
                setResultMessage(msg);
                setResultOpen(true);
            });
    };

    return (
        <div className="mt-10 border-t pt-8 relative">
            <BlockingLoader show={saving} />

            <h3 className="text-lg font-semibold mb-4">Change Password</h3>

            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm mb-1">Current Password</label>
                    <input
                        type="password"
                        placeholder="Enter Old Password"

                        className="border rounded-lg w-full px-3 py-2"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">New Password</label>
                    <input
                        type="password"
                        placeholder="Enter New Password"

                        className="border rounded-lg w-full px-3 py-2"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Re-Enter New Password"
                        className="border rounded-lg w-full px-3 py-2"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </div>

                {localError && <p className="text-sm text-red-600">{localError}</p>}

                <button
                    onClick={submit}
                    disabled={saving}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Update Password"}
                </button>
            </div>

            <ResultModal
                open={resultOpen}
                success={resultSuccess}
                message={resultMessage}
                onClose={() => setResultOpen(false)}
            />
        </div>
    );
}
