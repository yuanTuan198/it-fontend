import React from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const openIE = async () => {
    try {
      await axios.post('http://localhost:4000/open-ie', {
        url: 'https://www.google.com', // Thay đổi URL tại đây nếu muốn
      });
      alert('Đã gửi lệnh mở Internet Explorer');
    } catch (error: any) {
      alert('Không thể mở IE: ' + error.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Mở Internet Explorer</h2>
      <button onClick={openIE}>Mở IE với URL</button>
    </div>
  );
};

export default App;
