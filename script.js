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
  const messageModalClose = document.querySelector('.message-modal-close');
  const messageForm = document.getElementById('messageForm');

  // Open modal
  messageBtn.addEventListener('click', () => {
    messageModal.classList.add('show');
  });

  // Close modal
  messageModalClose.addEventListener('click', () => {
    messageModal.classList.remove('show');
  });

  // Close modal when clicking outside
  messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) {
      messageModal.classList.remove('show');
    }
  });

  // Handle form submission
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

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

      alert('Message sent successfully! We\'ll get back to you soon.');
      messageForm.reset();
      messageModal.classList.remove('show');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    }
  });
});
