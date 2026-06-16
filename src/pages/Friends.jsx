function Friends({ data }) {
  // Use data from props, fallback to empty defaults if still loading
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
    <div className="friends-page" style={{ padding: '20px', color: '#fff' }}>
      <h2 style={{ marginBottom: '20px' }}>👥 Friends</h2>

      {/* Stats Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px', 
        marginBottom: '20px' 
      }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{referralData.referralCount}</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Total Friends</div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffcc00' }}>{referralData.referralRewards}</div>
          <div style={{ fontSize: '12px', opacity: 0.6 }}>Rewards Earned</div>
        </div>
      </div>

      {/* Referral Link & Actions */}
      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '15px', marginBottom: '25px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Your Referral Link</h4>
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '10px', 
          borderRadius: '8px', 
          fontSize: '12px', 
          wordBreak: 'break-all',
          marginBottom: '15px',
          color: '#0088cc'
        }}>
          {referralData.referralLink || 'Generating...'}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button onClick={handleCopy} style={buttonStyle('#333')}>Copy Link</button>
          <button onClick={handleShare} style={buttonStyle('#0088cc')}>Share</button>
        </div>
      </div>

      <h3 style={{ marginBottom: '15px' }}>Referred Friends</h3>
      <div className="friend-list">
        {!data ? (
          <p>Loading friends...</p>
        ) : referralData.friends.length > 0 ? (
          referralData.friends.map(friend => (
            <div key={friend.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '12px 15px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              marginBottom: '8px'
            }}>
              <span>{friend.first_name}</span>
              <span style={{ color: '#ffcc00' }}>+500</span>
            </div>
          ))
        ) : (
          <p style={{ opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>You haven't invited anyone yet.</p>
        )}
      </div>
    </div>
  );
}

const buttonStyle = (bg) => ({
  padding: '12px',
  borderRadius: '10px',
  border: 'none',
  background: bg,
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer'
});

export default Friends;