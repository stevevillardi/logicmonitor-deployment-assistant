interface SystemCredential {
    name: string;
    description: string;
    category: string;
}

interface CredentialsList {
    systemCredentials: {
        [key: string]: SystemCredential;
    };
}

export async function fetchSystemCredentials(): Promise<SystemCredential[]> {
    try {
        const response = await fetch('/api/credentials-list');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const credentials = await response.json();
        
        // Ensure we received an array
        if (!Array.isArray(credentials)) {
            console.error('Unexpected response format:', credentials);
            return [];
        }

        return credentials;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching system credentials:', error.message);
        } else {
            console.error('Unknown error fetching system credentials');
        }
        return [];
    }
} 