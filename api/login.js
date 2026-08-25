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

        const { sub, name, picture } = lineUser;

        const { data, error } = await supabase
            .from("users")
            .upsert(
                {
                    line_user_id: sub,
                    display_name: name,
                    picture_url: picture
                },
                {
                    onConflict: "line_user_id"
                }
            )
            .select()
            .single();

        if (error) {
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
            message: error.message
        });
    }
}