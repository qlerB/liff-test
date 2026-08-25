export async function verifyLineIdToken(idToken) {
    if (!idToken) {
        throw new Error("idToken is required");
    }

    const response = await fetch(
        "https://api.line.me/oauth2/v2.1/verify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                id_token: idToken,
                client_id: "2011217255"
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("LINE verification failed:", data);
        throw new Error("Invalid LINE ID token");
    }

    return data;
}