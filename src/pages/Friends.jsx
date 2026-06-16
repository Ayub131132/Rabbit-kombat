function Friends({ data }) {
  const referralData = data || {
    referralLink: '',
    referralCount: 0,
    referralRewards: 0,
    friends: []
  };

  const handleCopy = () => {
    if (!referralData.referralLink) return;
    navigator.clipboard.writeText(referralData.referralLink);
    alert('Referral link copied!');
  };

  const handleShare = () => {
    if (!referralData.referralLink) return;
    const text = "Join me on Rabbit Kombat!";
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralData.referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="friends-page">
      <h2 className="friends-title">👥 Friends</h2>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-value">{referralData.referralCount}</div>
          <div className="stats-label">Total Friends</div>
        </div>
        <div className="stats-card">
          <div className="stats-value highlight">{referralData.referralRewards}</div>
          <div className="stats-label">Rewards Earned</div>
        </div>
      </div>

      <div className="referral-card">
        <h4 className="referral-link-title">Your Referral Link</h4>
        <div className="referral-link-box">
          {referralData.referralLink || 'Generating...'}
        </div>
        
        <div className="action-grid">
          <button onClick={handleCopy} className="btn-base btn-copy">Copy Link</button>
          <button onClick={handleShare} className="btn-base btn-share">Share</button>
        </div>
      </div>

      <h3 className="friend-list-title">Referred Friends</h3>
      <div className="friend-list">
        {!data ? (
          <p>Loading friends...</p>
        ) : referralData.friends.length > 0 ? (
          referralData.friends.map(friend => (
            <div key={friend.id} className="friend-item">
              <span>{friend.first_name}</span>
              <span className="reward-text">+500</span>
            </div>
          ))
        ) : (
          <p className="empty-friends">You haven't invited anyone yet.</p>
        )}
      </div>
    </div>
  );
}

export default Friends;