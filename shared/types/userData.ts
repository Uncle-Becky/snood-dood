export type GameUserData = {
    id: string;
    username: string;
    favoriteColor: string;
    weapons: string[];
}

export type RedditUserData = {
    username: string;
    userId: string;
}

export type CollaborationUserData = {
    id: string;
    username: string;
    isAuthenticated: boolean;
}
