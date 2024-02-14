import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './postList.css';

const PostList = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/posts');
        const postsWithCount = response.data.map(post => ({ ...post, count: 0 }));
        setPosts(postsWithCount);
        // Initialize comments state with empty arrays for each post
        const initialComments = {};
        postsWithCount.forEach(post => {
          initialComments[post._id] = '';
        });
        setComments(initialComments);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const onLikeButton = async (postId, userId) => {
    try {
      const response = await axios.post('http://localhost:3001/posts/like', {
        postId: postId,
        userId: userId,
      });
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          return { ...post, likesCount: response.data.likesCount }; // Update likesCount with the response from the server
        }
        return post;
      });
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  };

  const onSubmitComment = async (postId, userId, comment) => {
    try {
      await axios.post('http://localhost:3001/posts/comment', {
        postId: postId,
        userId: userId,
        comment: comment,
      });
      // Refresh posts after adding comment
      const response = await axios.get('http://localhost:3001/posts');
      const updatedPosts = response.data.map(post => ({ ...post, count: 0 }));
      setPosts(updatedPosts);
      // Clear new comment input
      setComments({ ...comments, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentChange = (postId, comment) => {
    setComments({ ...comments, [postId]: comment });
  };

  return (
    <>
      <h1>POSTS</h1>
      {posts.map(post => (
        <div key={post._id} className='main-container'>
          <div className='profile-container'>
            <img src={post.userProfileUrl} alt="Profile" className='profile-image' />
            <span>{post.userName}</span>
          </div>

          <div className='post-container'>
            <p>{post.caption}</p>
            <img src={post.imageUrl} alt="Post" className='post-image' />
          </div>

          <div className='like-container'>
            <button className='like-button' onClick={() => onLikeButton(post._id, post.userId)}>
              
                <img src='https://res.cloudinary.com/ddgnliekv/image/upload/v1707895146/ezhu58n8uzcxccvvjgpd.png' className='like-button' />
              
            </button>
            <p>{post.likesCount}</p> {/* Display updated likes count */}
          </div>

          {/* Comment section */}
          <div>
            <input
              type="text"
              value={comments[post._id]}
              onChange={e => handleCommentChange(post._id, e.target.value)}
              placeholder="Add a comment..."
            />
            <button onClick={() => onSubmitComment(post._id, post.userId, comments[post._id])}>Submit</button>
          </div>
        </div>
      ))}
    </>
  );
};

export default PostList;
