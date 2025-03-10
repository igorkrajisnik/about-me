// DOM Elements
const commandEl = document.getElementById('command');
const vimEditor = document.getElementById('vim-editor');
const lineNumbers = document.getElementById('line-numbers');
const editorContent = document.getElementById('editor-content');
const cursor = document.getElementById('cursor');
const vimMode = document.getElementById('vim-mode');
const cursorPosition = document.getElementById('cursor-position');

// Content to be typed - adjusted line lengths for better mobile display
const profileContent = `PROFESSIONAL PROFILE
Senior IT Engineer with a proven track record of developing high-performance 
enterprise applications and driving technical innovation across industries.

LEADERSHIP
Successfully led diverse, multi-cultural engineering teams through complete 
development lifecycles of next-generation software solutions—from initial 
requirement gathering and architectural design to implementation, testing, 
and deployment.

BUSINESS ACUMEN
Regularly contributes to client proposals and presentations, excelling at 
synthesizing business requirements and user needs into high-quality, 
cost-effective design solutions while adhering to budgetary constraints.

EXPERIENCE & EDUCATION
• 15+ years of professional experience in the IT industry
• University degree in Information Technology 
• Bachelor's degree in Economics

CONTACT
igor@krajisnik.no`;

// Split content into lines
const contentLines = profileContent.split('\n');

// Configuration
const TYPING_DELAY = 15; // ms between characters
const COMMAND_DELAY = 30; // ms between command characters

// Animation state
let commandTyped = false;
let typing = false;
let currentLine = 0;
let currentChar = 0;
let displayContent = [];

// Add a line number
function addLineNumber(num) {
    const lineNum = document.createElement('div');
    lineNum.textContent = num;
    lineNum.style.height = getComputedStyle(editorContent).lineHeight;
    lineNumbers.appendChild(lineNum);
}

// Update display
function updateDisplay() {
    let html = '';
    
    // Create HTML content 
    for (let i = 0; i < displayContent.length; i++) {
        let line = displayContent[i];
        
        // Apply syntax highlighting
        if (line.startsWith('PROFESSIONAL PROFILE') || 
            line.startsWith('LEADERSHIP') ||
            line.startsWith('BUSINESS ACUMEN') ||
            line.startsWith('EXPERIENCE & EDUCATION') ||
            line.startsWith('CONTACT')) {
            line = `<span class="section-header">${line}</span>`;
        }
        
        // Email formatting - make it clickable
        if (line.includes('igor@krajisnik.no')) {
            line = line.replace('igor@krajisnik.no', '<a href="mailto:igor@krajisnik.no" class="contact-info">igor@krajisnik.no</a>');
        }
        
        html += `<div>${line}</div>`;
    }
    
    editorContent.innerHTML = html;
    
    // After updating content, recalculate line numbers
    updateLineNumbers();
}

// Update line numbers based on actual visual lines
function updateLineNumbers() {
    // Clear existing line numbers
    lineNumbers.innerHTML = '';
    
    // Get all lines
    const lines = editorContent.querySelectorAll('div');
    let lineNumberCount = 1;
    
    lines.forEach(line => {
        // Get the actual height of the line
        const lineHeight = parseInt(getComputedStyle(line).lineHeight);
        const actualHeight = line.offsetHeight;
        
        // Calculate how many visual lines this logical line takes
        const visualLines = Math.max(1, Math.ceil(actualHeight / lineHeight));
        
        // Add line numbers for each visual line
        for (let i = 0; i < visualLines; i++) {
            addLineNumber(lineNumberCount++);
        }
    });
}

// Set cursor position
function setCursorPosition() {
    // Get the current line element
    const lines = editorContent.querySelectorAll('div');
    if (currentLine >= lines.length) return;
    
    const line = lines[currentLine];
    
    // Get the position of the line
    const lineRect = line.getBoundingClientRect();
    const editorRect = editorContent.getBoundingClientRect();
    
    // Set cursor top position (relative to the editor)
    let top = lineRect.top - editorRect.top;
    
    // Use a measurement span to get the exact position for the cursor
    const measure = document.createElement('span');
    measure.style.visibility = 'hidden';
    measure.style.position = 'absolute';
    measure.style.whiteSpace = 'pre';
    
    // Text up to the cursor position (without HTML)
    const lineText = displayContent[currentLine] || '';
    measure.textContent = lineText.substring(0, currentChar);
    
    line.appendChild(measure);
    
    // Calculate the exact left position based on character count
    let left;
    if (currentChar > 0) {
        const measureRect = measure.getBoundingClientRect();
        left = measureRect.width + 10; // 10px is the padding
    } else {
        left = 10; // Start position (padding)
    }
    
    // Set the cursor position
    cursor.style.top = `${top}px`;
    cursor.style.left = `${left}px`;
    
    // Clean up
    line.removeChild(measure);
    
    // Update cursor position in status bar
    cursorPosition.textContent = `${currentLine + 1},${currentChar}`;
}

// Type command
function typeCommand() {
    const command = 'vim about.txt';
    let index = 0;
    
    function typeNextChar() {
        if (index < command.length) {
            commandEl.textContent += command[index];
            index++;
            setTimeout(typeNextChar, COMMAND_DELAY);
        } else {
            commandTyped = true;
            setTimeout(startVim, 700);
        }
    }
    
    typeNextChar();
}

// Start "Vim"
function startVim() {
    vimEditor.style.display = 'flex';
    vimMode.textContent = 'INSERT';
    vimMode.style.color = '#98c379';
    
    // Initialize first line
    displayContent.push('');
    addLineNumber(1);
    updateDisplay();
    
    // Start typing
    typing = true;
    typeContent();
}

// Type content
function typeContent() {
    if (currentLine >= contentLines.length) {
        // Typing complete
        typing = false;
        vimMode.textContent = 'NORMAL';
        vimMode.style.color = '#61afef';
        return;
    }
    
    // Get the current line
    const line = contentLines[currentLine];
    
    // If we've reached the end of this line
    if (currentChar >= line.length) {
        // Move to next line
        currentLine++;
        currentChar = 0;
        
        // Add a new line if needed
        if (currentLine < contentLines.length) {
            displayContent.push('');
            addLineNumber(currentLine + 1);
            updateDisplay();
            setCursorPosition();
        }
        
        // Continue typing
        setTimeout(typeContent, TYPING_DELAY);
        return;
    }
    
    // Add the next character
    displayContent[currentLine] += line[currentChar];
    currentChar++;
    
    // Update display
    updateDisplay();
    setCursorPosition();
    
    // Type the next character
    setTimeout(typeContent, TYPING_DELAY);
}

// Add window resize handler to update line numbers when viewport changes
window.addEventListener('resize', () => {
    if (typing) {
        updateLineNumbers();
    }
});

// Start the animation
window.onload = function() {
    setTimeout(typeCommand, 600);
};