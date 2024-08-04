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
const user1 = new User("aliceinwonderland", "Alice", 25, "female", ["Ally"], "Apple", "Honolulu");
const user2 = new User("bobby", "Bob", 30, "male", ["Bobby"], "Microsoft", "Tokyo");
const user3 = new User("charlie", "Charles", 35, "male", ["Charlie"], "Google", "Seoul");
const user4 = new User("daisyduke", "Daisy", 28, "female", ["Duke"], "Amazon", "New York");
const user5 = new User("theeagle", "Eddy", 32, "male", ["Eagle"], "Facebook", "London");

// Add connections
user1.addConnection("follows", user2);
user2.addConnection("friends", user3);
user3.addConnection("co-worker", user4);
user4.addConnection("blocked", user5);
user5.addConnection("has read posts by", user1);

// Add posts
const post1 = user1.addPost("Post 1: Hello, world!", "2023-01-01T10:00:00Z");
const post2 = user2.addPost("Post 2: Good Morning!", "2023-01-02T09:00:00Z");
const post3 = user1.addPost("Post 3: Good Night!", "2023-01-03T22:00:00Z");
const post4 = user3.addPost("Post 4: Hello Again!", "2023-01-04T08:00:00Z");
const post5 = user4.addPost("Post 5: Exciting News!", "2023-01-05T12:00:00Z");
const post6 = user5.addPost("Post 6: Important Update!", "2023-01-06T14:00:00Z");

// Add comments to posts
user2.addComment("Nice post!", "2023-01-01T11:00:00Z", post1);
user3.addComment("Agreed!", "2023-01-01T12:00:00Z", post1);
user1.addComment("Good Morning to you too!", "2023-01-02T10:00:00Z", post2);
user3.addComment("Have a good night!", "2023-01-03T23:00:00Z", post3);
user4.addComment("Thanks for updating!", "2023-01-06T15:00:00Z", post6);
user5.addComment("Wow thats interesting!", "2023-01-05T13:00:00Z", post5);
user1.addComment("So proud!", "2023-01-06T16:00:00Z", post6);
user2.addComment("Good Job!", "2023-01-06T16:50:00Z", post6);
user3.addComment("You're so funny!", "2023-01-06T16:30:00Z", post6);
user3.addComment("Wow!", "2023-01-06T16:30:00Z", post6);
user3.addComment("Amazing!", "2023-01-06T16:30:00Z", post6);
user3.addComment("Cool!", "2023-01-06T16:30:00Z", post6);
user3.addComment("=)!", "2023-01-06T16:30:00Z", post6);

// Add views to posts
post1.addView(user1, "2023-01-01T10:25:00Z");
post1.addView(user2, "2023-01-01T10:30:00Z");
post1.addView(user3, "2023-01-01T11:30:00Z");
post1.addView(user4, "2023-01-01T12:30:00Z");
post2.addView(user1, "2023-01-02T09:30:00Z");
post2.addView(user3, "2023-01-02T10:30:00Z");
post3.addView(user3, "2023-01-03T22:30:00Z");
post3.addView(user2, "2023-01-03T23:30:00Z");
post4.addView(user1, "2023-01-04T08:30:00Z");
post4.addView(user2, "2023-01-04T09:00:00Z");
post4.addView(user5, "2023-01-04T09:30:00Z");
post5.addView(user1, "2023-01-05T12:30:00Z");
post5.addView(user2, "2023-01-05T13:00:00Z");
post5.addView(user3, "2023-01-05T13:30:00Z");
post6.addView(user1, "2023-01-06T14:30:00Z");
post6.addView(user2, "2023-01-06T15:00:00Z");
post6.addView(user4, "2023-01-06T15:30:00Z");

// Function to calculate importance
function calculateImportance(post, criteria) {
  if (criteria === "comments") {
    return post.comments.length;
  } else if (criteria === "views") {
    return post.views.length;
  } else { // blend
    return 0.5 * post.comments.length + 0.5 * post.views.length;
  }
}

// Generate graph data for D3.js
const nodes = [];
const links = [];

function updateGraph(criteria) {
  nodes.length = 0; // Clear nodes
  links.length = 0; // Clear links

  // Add user nodes
  const userMap = new Map();
  [user1, user2, user3, user4, user5].forEach(user => {
    const userNode = {
      id: user.username,
      type: 'user',
      label: user.username
    };
    nodes.push(userNode);
    userMap.set(user.username, userNode);
  });

  // Add post nodes
  const postMap = new Map();
  const allPosts = [user1.posts, user2.posts, user3.posts, user4.posts, user5.posts].flat();

  let mostCommentedPost = null;
  let mostViewedPost = null;

  allPosts.forEach(post => {
    if (!mostCommentedPost || post.comments.length > mostCommentedPost.comments.length) {
      mostCommentedPost = post;
    }
    if (!mostViewedPost || post.views.length > mostViewedPost.views.length) {
      mostViewedPost = post;
    }

    const importance = calculateImportance(post, criteria);
    const postNode = {
      id: post.content,
      type: 'post',
      label: post.content,
      importance: importance,
      comments: post.comments.length,
      views: post.views.length
    };
    nodes.push(postNode);
    postMap.set(post.content, postNode);

    // Add authorship link
    links.push({
      source: post.author.username,
      target: post.content,
      type: 'authorship'
    });

    // Add comment links
    post.comments.forEach(comment => {
      links.push({
        source: comment.author.username,
        target: post.content,
        type: 'comment'
      });
    });

    // Add view links
    post.views.forEach(view => {
      links.push({
        source: view.user.username,
        target: post.content,
        type: 'view'
      });
    });
  });

  const mostImportantPostDiv = document.getElementById("most-important-post");
  if (criteria === "comments") {
    mostImportantPostDiv.innerText = `Most Commented Post: ${mostCommentedPost.content}`;
  } else if (criteria === "views") {
    mostImportantPostDiv.innerText = `Most Viewed Post: ${mostViewedPost.content}`;
  } else if (criteria === "blend") {
    mostImportantPostDiv.innerText = `Most Commented Post: ${mostCommentedPost.content} \n Most Viewed Post: ${mostViewedPost.content}`;
  } else {
    mostImportantPostDiv.innerText = '';
  }

  // Update the graph
  renderGraph(criteria);
}

function renderGraph(criteria) {
  // Clear existing graph
  svg.selectAll("*").remove();

  // Create simulation
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Create links
  const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke-width", 2)
    .attr("stroke", "#999");

  // Create nodes
  const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", d => d.type === 'user' ? 10 : 5 + d.importance * 2)
    .attr("fill", d => d.type === 'user' ? "blue" : "red")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Add labels
  const label = svg.append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("dy", -3)
    .text(d => d.label);

  // Add comments and views count based on criteria
  const stats = svg.append("g")
    .attr("class", "stats")
    .selectAll("text")
    .data(nodes.filter(d => d.type === 'post'))
    .enter().append("text")
    .attr("dy", 15)
    .text(d => criteria === "comments" ? `Comments: ${d.comments}` : criteria === "views" ? `Views: ${d.views}` : `Comments: ${d.comments}, Views: ${d.views}`);

  // Define ticked function
  simulation
    .nodes(nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(links);

  function ticked() {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);

    stats
      .attr("x", d => d.x)
      .attr("y", d => d.y + 15);
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Initialize SVG
let svg;
const width = 960;
const height = 600;

function initializeSVG() {
  d3.select("#graph-container").selectAll("*").remove();
  svg = d3.select("#graph-container").append("svg")
    .attr("width", width)
    .attr("height", height);
}

// Event listener for criteria change
document.getElementById("importance-criteria").addEventListener("change", (event) => {
  const criteria = event.target.value;
  updateGraph(criteria);
});

// Event listener for button click
document.getElementById("load-graph").addEventListener("click", () => {
  initializeSVG();
  const criteria = document.getElementById("importance-criteria").value;
  updateGraph(criteria);
});
