document.addEventListener('DOMContentLoaded', () => {
  // Define classes and functions

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

  // Populate posts for wordCloud to reference
  // Create users
  const user1 = new User("aliceinwonderland", "Alice", 25, "female", ["Ally"], "Apple", "Honolulu");
  const user2 = new User("bobthebuilder", "Bob", 30, "male", ["Bobby"], "Microsoft", "Honolulu");
  const user3 = new User("charliechaplin", "Charles", 35, "male", ["Charlie"], "Google", "Honolulu");

  // Add connections
  user1.addConnection("follows", user2);
  user2.addConnection("friends", user3);
  user3.addConnection("follows", user1);

  // Add posts
  const post1 = user1.addPost("I love programming in JavaScript! It's such a versatile language.", "2024-07-29T10:00:00Z");
  const post2 = user2.addPost("Learning new frameworks can be challenging but rewarding. I love it!", "2024-07-30T08:00:00Z");
  const post3 = user3.addPost("JavaScript and Python are my favorite languages for data analysis. Love them!", "2024-07-31T09:00:00Z");

  // Add comments to posts
  user2.addComment("Great post, Alice! JavaScript is indeed versatile.", "2024-07-29T10:30:00Z", post1);
  user3.addComment("I agree, JavaScript is very powerful.", "2024-07-29T11:00:00Z", post1);
  user1.addComment("Absolutely! Frameworks can be tricky but fun.", "2024-07-30T08:30:00Z", post2);

  // Add views to posts
  post1.addView(user2, "2024-07-29T10:15:00Z");
  post1.addView(user3, "2024-07-29T11:15:00Z");
  post2.addView(user1, "2024-07-30T08:15:00Z");
  post3.addView(user1, "2024-07-31T09:15:00Z");

  // Tokenize and clean text into words
  function extractWords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 0); // Remove empty words
  }

  // Count the frequency of each word
  function countWords(words) {
    return words.reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {});
  }

  // Filter posts based on keywords and user attributes
  function filterPosts(users, includeKeywords = [], excludeKeywords = [], userFilters = {}) {
    const posts = users.flatMap(user => user.posts);

    return posts.filter(post => {
      // Check for include/exclude keywords
      const contentIncludesIncludeKeywords = includeKeywords.length === 0 || includeKeywords.some(keyword => post.content.toLowerCase().includes(keyword.toLowerCase()));
      const contentExcludesExcludeKeywords = excludeKeywords.length === 0 || !excludeKeywords.some(keyword => post.content.toLowerCase().includes(keyword.toLowerCase()));

      // Check user attributes
      const userMatchesAttributes = Object.keys(userFilters).every(attr => post.author[attr] === userFilters[attr]);

      return contentIncludesIncludeKeywords && contentExcludesExcludeKeywords && userMatchesAttributes;
    });
  }

  // Create and display a basic word cloud
  function createWordCloud(users, includeKeywords, excludeKeywords, userFilters) {
    const filteredPosts = filterPosts(users, includeKeywords, excludeKeywords, userFilters);
    const allWords = filteredPosts.flatMap(post => extractWords(post.content));
    const wordCounts = countWords(allWords);

    // Draw the word cloud on the canvas
    const canvas = document.getElementById('word-cloud-canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Basic word cloud settings
    const fontSizeRange = [3, 30];
    const maxWords = 50;
    const padding = 10; // Padding around words

    // Convert wordCounts to an array and sort by frequency
    const words = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, maxWords);

    // Array to store positions and dimensions of placed words
    const placedWords = [];

    function isOverlap(x, y, wordWidth, wordHeight) {
      for (const { x: px, y: py, width, height } of placedWords) {
        if (x < px + width + padding && x + wordWidth > px - padding &&
          y < py + height + padding && y + wordHeight > py - padding) {
          return true;
        }
      }
      return false;
    }

    words.forEach(([word, count]) => {
      const fontSize = fontSizeRange[0] + (count / words[0][1]) * (fontSizeRange[1] - fontSizeRange[0]);
      ctx.font = `${fontSize}px Arial`;
      const wordWidth = ctx.measureText(word).width;
      const wordHeight = fontSize;
      let x, y, attempts = 0;
      const maxAttempts = 100;

      do {
        x = Math.random() * (width - wordWidth - 2 * padding) + padding;
        y = Math.random() * (height - wordHeight - 2 * padding) + padding;
        attempts++;
      } while ((isOverlap(x, y, wordWidth, wordHeight) || x + wordWidth > width || y + wordHeight > height) && attempts < maxAttempts);

      // If a valid position is found, draw the word
      if (attempts < maxAttempts) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
        ctx.fillText(word, x, y);

        // Save the position and dimensions of the word
        placedWords.push({ x, y, width: wordWidth, height: wordHeight });
      }
    });

    console.log("Generating Random Placement Word Cloud...");
  }

  createWordCloud([user1, user2, user3], [], [], {});
});
