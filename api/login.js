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
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "idToken is required"
            });
        }

        const verifyResponse = await fetch(
            "https://api.line.me/oauth2/v2.1/verify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    id_token: idToken,
                    client_id: "2011217255-PUqd4FGU"
                })
            }
        );

        const lineData = await verifyResponse.json();

        if (!verifyResponse.ok) {
            console.error("LINE verification failed:", lineData);

            return res.status(401).json({
                success: false,
                message: "Invalid LINE ID token"
            });
        }

        const { sub, name, picture } = lineData;

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

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}