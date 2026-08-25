import { createClient } from "@supabase/supabase-js";
import { verifyLineIdToken } from "./_lib/lineAuth.js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {
        const { idToken } = req.body;

        const lineUser = await verifyLineIdToken(idToken);

        const { data, error } = await supabase
            .from("users")
            .select("id, line_user_id, display_name, picture_url, created_at")
            .eq("line_user_id", lineUser.sub)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        return res.status(200).json({
            success: true,
            user: data
        });

    } catch (error) {
        console.error(error);

        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
}