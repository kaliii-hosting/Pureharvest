// ------- Osmo [https://osmo.supply/] ------- //

import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function() {
  const wordList = document.querySelector('[data-looping-words-list]');
  const words = Array.from(wordList.children);
  const totalWords = words.length;
  const wordHeight = 100 / totalWords; // Offset as a percentage
  const edgeElement = document.querySelector('[data-looping-words-selector]');
  let currentIndex = 0;

  function updateEdgeWidth() {
    const centerIndex = (currentIndex + 1) % totalWords;
    const centerWord = words[centerIndex];
    const centerWordWidth = centerWord.getBoundingClientRect().width;
    const listWidth = wordList.getBoundingClientRect().width;
    const percentageWidth = (centerWordWidth / listWidth) * 100;
    gsap.to(edgeElement, {
      width: `${percentageWidth}%`,
      duration: 0.5,
      ease: 'Expo.easeOut',
    });
  }

  function moveWords() {
    currentIndex++;
    gsap.to(wordList, {
      yPercent: -wordHeight * currentIndex,
      duration: 1.2,
      ease: 'elastic.out(1, 0.85)',
      onStart: updateEdgeWidth,
      onComplete: function() {
        if (currentIndex >= totalWords - 3) {
          wordList.appendChild(wordList.children[0]);
          currentIndex--;
          gsap.set(wordList, { yPercent: -wordHeight * currentIndex });
          words.push(words.shift());
        }
      }
    });
  }

  updateEdgeWidth();
  gsap.timeline({ repeat: -1, delay: 1 })
    .call(moveWords)
    .to({}, { duration: 2 })
    .repeat(-1);

  // Message Button and Modal Functionality
  const messageBtn = document.getElementById('messageBtn');
  const messageModal = document.getElementById('messageModal');
  const glassClose = document.querySelector('.glass-close');
  const messageForm = document.getElementById('messageForm');
  const successPopup = document.getElementById('successPopup');

  // Open modal
  messageBtn.addEventListener('click', () => {
    messageModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  });

  // Close modal
  glassClose.addEventListener('click', () => {
    messageModal.classList.remove('show');
    document.body.style.overflow = '';
  });

  // Close modal when clicking on background
  messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) {
      messageModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  });

  // Show success popup
  function showSuccessPopup() {
    successPopup.classList.add('show');

    // Auto-close after 3 seconds
    setTimeout(() => {
      successPopup.classList.remove('show');
      document.body.style.overflow = '';
    }, 3000);
  }

  // Close success popup on click
  successPopup.addEventListener('click', () => {
    successPopup.classList.remove('show');
    document.body.style.overflow = '';
  });

  // Handle form submission
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = messageForm.querySelector('.glass-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const message = document.getElementById('userMessage').value;

    try {
      // Add message to Firebase Firestore
      await addDoc(collection(db, 'messages'), {
        name: name,
        email: email,
        message: message,
        timestamp: serverTimestamp()
      });

      // Close modal
      messageModal.classList.remove('show');

      // Reset form
      messageForm.reset();

      // Show success popup with animation
      setTimeout(() => {
        showSuccessPopup();
      }, 300);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Admin access via footer
  const adminAccess = document.getElementById('adminAccess');
  adminAccess.addEventListener('click', () => {
    window.location.href = '/admin';
  });

  // Email button functionality
  const emailBtn = document.getElementById('emailBtn');
  emailBtn.addEventListener('click', () => {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const message = document.getElementById('userMessage').value;

    if (!name || !email || !message) {
      alert('Please fill in all fields before sending via email.');
      return;
    }

    // Create mailto link with form data
    const subject = encodeURIComponent(`Contact Form Submission from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const mailtoLink = `mailto:info@pureharvest.shop?subject=${subject}&body=${body}`;

    // Open default email client
    window.location.href = mailtoLink;
  });
});
