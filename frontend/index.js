import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Modal elements
    const modal = document.getElementById('modal');
    const newPostBtn = document.getElementById('newPostBtn');
    const closeBtn = document.querySelector('.close');
    const postForm = document.getElementById('postForm');

    // Modal controls
    newPostBtn.onclick = () => modal.style.display = "block";
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Form submission
    postForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const body = quill.root.innerHTML;

        // Show loading state
        const submitButton = postForm.querySelector('button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Publishing...';
        submitButton.disabled = true;

        try {
            await backend.createPost(title, body, author);
            modal.style.display = "none";
            postForm.reset();
            quill.setContents([]);
            await loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post. Please try again.');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    };

    // Load initial posts
    await loadPosts();
});

async function loadPosts() {
    const postsContainer = document.getElementById('posts');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    postsContainer.innerHTML = '';

    try {
        const posts = await backend.getPosts();
        loading.style.display = 'none';

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">No posts yet. Be the first to write something!</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        loading.textContent = 'Failed to load posts. Please refresh the page.';
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';
    
    const date = new Date(Number(post.timestamp / 1000000n));
    
    article.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            <span class="author">By ${post.author}</span>
            <span class="date">${date.toLocaleDateString()}</span>
        </div>
        <div class="post-content">${post.body}</div>
    `;
    
    return article;
}
