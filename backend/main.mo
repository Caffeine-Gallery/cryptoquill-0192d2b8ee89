import Int "mo:base/Int";
import Nat "mo:base/Nat";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";

actor {
    // Post type definition
    public type Post = {
        id: Nat;
        title: Text;
        body: Text;
        author: Text;
        timestamp: Int;
    };

    // Stable variable to store posts
    private stable var posts : [Post] = [];
    private stable var nextId : Nat = 0;

    // Create a new post
    public shared func createPost(title: Text, body: Text, author: Text) : async Post {
        let post : Post = {
            id = nextId;
            title = title;
            body = body;
            author = author;
            timestamp = Time.now();
        };
        
        nextId += 1;
        posts := Array.append(posts, [post]);
        return post;
    };

    // Get all posts in reverse chronological order
    public query func getPosts() : async [Post] {
        Array.tabulate<Post>(posts.size(), func (i) = posts[posts.size() - 1 - i])
    };
}
