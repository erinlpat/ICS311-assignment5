//socialMedia.js data structure
class User {
  constructor(username, realName, age, gender, nicknames, workplace, location) {
    this.username = username;
    this.realName = realName;
    this.age = age;
    this.gender = gender;
    this.nicknames = nicknames;
    this.workplace = workplace;
    this.location = location;
    this.connections = [];  //connection objects
    this.posts = [];  //post objects
    this.readPosts = [];  //read post objects
    this.comments = [];  //comment objects
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

//reportGenerator class
class reportGenerator {
  constructor(users) {
    this.users = users; //list of User objects
  }

  //function that filters posts by keyword
  filterPostsByKeyword(posts, keywords, include = true) {
    return posts.filter(post => {
      const containsKeyword = keywords.some(keyword => post.content.includes(keyword));
      return include ? containsKeyword : !containsKeyword;
    });
  }

  //function that filters posts by user attributes
  filterPostsByUserAttributes(posts, attributes) {
    return posts.filter(post => {
      const user = post.author;
      return Object.entries(attributes).every(([key, value]) => user[key] === value);
    });
  }

  //function to generate the trending posts report
  generateTrendingPostsReport(keywords = [], includeKeywords = true, userAttributes = {}) {
    const allPosts = this.users.flatMap(user => user.posts);

    //filter posts based on keywords
    const filteredPosts1 = this.filterPostsByKeyword(allPosts, keywords, includeKeywords);

    //filter posts based on user attributes
    const filteredPosts2 = this.filterPostsByUserAttributes(filteredPosts1, userAttributes);

    //sort posts by the number of views (trending rate)
    const sortedPosts = filteredPosts2.sort((a, b) => b.views.length - a.views.length);

    return sortedPosts;
  }
}

//==========Testing==========//

//create users
const user1 = new User("alicinwonderland", "Alice", 25, "female", ["Ally"], "Apple", "Honolulu");
const user2 = new User("bobthebuilder", "Bob", 30, "male", ["Bobby"], "Microsoft", "Tokyo");
const user3 = new User("charliechaplin", "Charles", 35, "male", ["Charlie"], "Google", "Seoul");
const user4 = new User("johnDoe", "John", 30, "male", ["Doe"], "Facebook", "New York");

//add connections
user1.addConnection("follows", user2);
user2.addConnection("friends", user3);

//add posts
const post1 = user1.addPost("Hello, world! Check out this amazing post!", "2023-01-01T10:00:00Z");
const post2 = user2.addPost("Learning JavaScript is so much fun!", "2023-01-02T11:00:00Z");
const post3 = user3.addPost("Check out this cool JavaScript tutorial!", "2023-01-03T12:00:00Z");
const post4 = user4.addPost("JavaScript is the best programming language!", "2023-01-04T13:00:00Z");

//add comments to posts
user2.addComment("Nice post!", "2023-01-01T11:00:00Z", post1);
user3.addComment("Agreed!", "2023-01-01T12:00:00Z", post1);

//add views to posts
post1.addView(user2, "2023-01-01T10:30:00Z");
post1.addView(user3, "2023-01-01T11:30:00Z");
post2.addView(user1, "2023-01-02T11:30:00Z");
post2.addView(user3, "2023-01-02T12:30:00Z");
post4.addView(user1, "2023-01-04T13:30:00Z");

//create reportGenerator instance
const reportGen = new reportGenerator([user1, user2, user3, user4]);

//generate report
const trendingPosts = reportGen.generateTrendingPostsReport(
  ["JavaScript"], //keywords to include
  true,           //include posts containing the keywords
  { age: 30 }      //user attributes to filter by
);

//displays results in HTML
function displayReport(posts) {
  const reportDiv = document.getElementById('report');
  posts.forEach(post => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
      <h3>Post by ${post.author.username}</h3>
      <p>${post.content}</p>
      <p><strong>Created at:</strong> ${post.creationTime}</p>
      <p><strong>Views:</strong> ${post.views.length}</p>
    `;
    reportDiv.appendChild(postDiv);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  displayReport(trendingPosts);
});
