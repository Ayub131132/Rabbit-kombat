function Home({ data }) {
  return (
    <div className="home-page">
      <h2>🏠 Home Page</h2>
      <div className="points-container">
        <p>Points: <span className="points-value">{data?.referralRewards || 0}</span></p>
      </div>
    </div>
  );
}

export default Home;