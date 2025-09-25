import React from 'react';

const ClippyCharacter = ({ 
  animationState = 'idle', 
  onClick, 
  position = { bottom: 20, right: 20 } 
}) => {
  const getAnimationClass = () => {
    switch (animationState) {
      case 'watching': return 'clippy-watching';
      case 'excited': return 'clippy-excited';
      case 'thinking': return 'clippy-thinking';
      default: return 'clippy-idle';
    }
  };

  return (
    <div 
      className={`clippy-character ${getAnimationClass()}`}
      onClick={onClick}
      title="Hi! I'm Clippy, your AI assistant! Click me for help! 📎"
      style={{
        bottom: `${position.bottom}px`,
        right: `${position.right}px`
      }}
    />
  );
};

export default ClippyCharacter;