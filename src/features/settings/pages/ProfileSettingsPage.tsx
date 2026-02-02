import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    loadMyProfile,
} from "../../publicProfile/slice";

import TeamMemberPublicProfileTab from "../../teams/components/details/publicProfile/TeamMemberPublicProfileTab";

export default function ProfileSettingsPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { role } = useAppSelector((s) => s.auth);
    // 🔐 only sales reps allowed
    useEffect(() => {
        if (role && role !== "sales_rep") {
            navigate("/unauthorized", { replace: true });
        }
    }, [role, navigate]);

    // load own profile
    useEffect(() => {
        dispatch(loadMyProfile());
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    My Public Profile
                </h1>

                <TeamMemberPublicProfileTab
                    useSelfApi={true}     // 👈 save via self API
                    showLockable={false} // 👈 hide locks
                />
            </div>
        </div>
    );
}
