class User {
  constructor(username, realName, age, gender, nicknames, workplace, location) {
    this.username = username;
    this.realName = realName;
    this.age = age;
    this.gender = gender;
    this.nicknames = nicknames;
    this.workplace = workplace;
    this.location = location;
    this.connections = [];  // List of Connection objects
    this.posts = [];  // List of Post objects
    this.readPosts = [];  // List of Post objects
    this.comments = [];  // List of Comment objects
  }

  addConnection(type, targetUser) {
    this.connections.push(new Connection(type, targetUser));
  }

  addPost(content, creationTime) {
    const post = new Post(content, creationTime, this);
    this.posts.push(post);
    return post;
  }

  addReadPost(post) {
    this.readPosts.push(post);
  }

  addComment(content, creationTime, post) {
    const comment = new Comment(content, creationTime, this);
    this.comments.push(comment);
    post.addComment(comment);
  }
}

class Post {
  constructor(content, creationTime, author) {
    this.content = content;
    this.creationTime = creationTime;
    this.author = author;
    this.comments = [];  // List of Comment objects
    this.views = [];  // List of {user, viewTime}
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  addView(user, viewTime) {
    this.views.push({ user, viewTime });
  }
}

class Comment {
  constructor(content, creationTime, author) {
    this.content = content;
    this.creationTime = creationTime;
    this.author = author;
  }
}

class Connection {
  constructor(type, targetUser) {
    this.type = type;
    this.targetUser = targetUser;
  }
}

// Create users
const user1 = new User("alicinwonderland", "Alice", 25, "female", ["Ally"], "Apple", "Honolulu");
const user2 = new User("bobthebuilder", "Bob", 30, "male", ["Bobby"], "Microsoft", "Tokyo");
const user3 = new User("charliechaplin", "Charles", 35, "male", ["Charlie"], "Google", "Seoul");

// Add connections
user1.addConnection("follows", user2);
user2.addConnection("friends", user3);

// Add posts
const post1 = user1.addPost("Hello, world!", "2023-01-01T10:00:00Z");

// Add comments to post
user2.addComment("Nice post!", "2023-01-01T11:00:00Z", post1);
user3.addComment("Agreed!", "2023-01-01T12:00:00Z", post1);

// Add views to post
post1.addView(user2, "2023-01-01T10:30:00Z");
post1.addView(user3, "2023-01-01T11:30:00Z");

function dfs(user, visited, cluster) {
  visited.add(user);
  cluster.push(user);
  for (const connection of user.connections) {
    if (!visited.has(connection.targetUser)) {
      dfs(connection.targetUser, visited, cluster);
    }
  }
}

//Example function display posts to show functional data structure
function displayPosts(posts) {
  posts.forEach(post => {
    console.log(`Post by ${post.author.username}: ${post.content} (Created: ${post.creationTime})`);
    console.log("  Comments:");
    post.comments.forEach(comment => {
      console.log(`   - Comment by ${comment.author.username}: ${comment.content} (Created: ${comment.creationTime})`);
    });
    console.log("  Views:");
    post.views.forEach(view => {
      console.log(`   - Viewed by ${view.user.username} at ${view.viewTime}`);
    });
  });
}

// Display posts and comments
console.log("Posts and Comments:");
displayPosts(user1.posts.concat(user2.posts));
