import { createClient } from "@supabase/supabase-js";

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
        const { userId, displayName, pictureUrl } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        const { data, error } = await supabase
            .from("users")
            .upsert(
                {
                    line_user_id: userId,
                    display_name: displayName,
                    picture_url: pictureUrl
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
                message: "Database error",
                error: error.message,
                details: error.details,
                hint: error.hint
            });
        }

        return res.status(200).json({
            success: true,
            user: data
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}