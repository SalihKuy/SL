import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [selectedInteger, setSelectedInteger] = useState(1);
  const [data, setData] = useState([]);
  const [userID, setUserID] = useState('');

  useEffect(() => {
    const cookieName = 'userID';
    let userID = getCookie(cookieName);
    if (!userID) {
      userID = uuidv4();
      setCookie(cookieName, userID, 365);
    }
    setUserID(userID);
  
    fetch(`https://localhost:7120/link?userID=${userID}`)
      .then(response => response.json())
      .then(data => {
        setData(data);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []);

  function getCookie(name) {
    const cookieArray = document.cookie.split('; ');
    const cookie = cookieArray.find(row => row.startsWith(name + '='));
    return cookie ? cookie.split('=')[1] : null;
  }

  function setCookie(name, value, days) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }

  function handleSubmit(event) {
    event.preventDefault();
    const submitValue = event.nativeEvent.submitter.value;
    const inputLink = event.target[0].value;
    const inputInteger = parseInt(event.target[1].value);
    const inputShortenedLink = event.target[3].value;

    const requestData = {
      userID: userID,
      link: inputLink,
      length: inputInteger,
      shortenedLink: submitValue === "Submit2" && inputShortenedLink ? inputShortenedLink : ""
    };

    fetch('https://localhost:7120/link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.error('Error:', errorData);
            throw new Error('Network response was not ok');
          });
        }
        return response.json();
      })
      .then(newData => {
        setData(prevData => [...prevData, newData]);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  function handleChange(event) {
    setInputValue(event.target.value);
  }

  function handleChange2(event) {
    setInputValue2(event.target.value);
  }

  function handleIntegerChange(event) {
    setSelectedInteger(event.target.value);
  }

  function handleDelete(id) {
    fetch(`https://localhost:7120/link/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) {
          console.error('Delete response was not ok:', response);
          throw new Error('Network response was not ok');
        }
        return response.text().then(text => {
          return text ? JSON.parse(text) : {};
        });
      })
      .then(() => {
        setData(prevData => {
          const updatedData = prevData.filter(item => item.id !== id);
          return updatedData;
        });
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "repeat(16, 1fr)" }}>
      <div style={{ backgroundColor: "#484848", gridRow: "span 1" }}></div>
      <div style={{ gridRow: "span 15" }}>
        <div style={{ display: "flex", height: "100vh" }}>
          <div style={{ flex: "3" }}>
            <form onSubmit={handleSubmit}>
              <div>
                <label>
                  Paste your link here:
                  <input type="text" value={inputValue} onChange={handleChange} style={{ height: "25px", borderRadius: "5px" }} />
                </label>
                <label>
                  <p>Customize the length of your link:</p>
                  <select value={selectedInteger} onChange={handleIntegerChange} style={{ height: "30px", borderRadius: "5px" }}>
                    {Array.from({ length: 46 }, (_, i) => i + 3).map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                </label>
                <input type="submit" value="Submit1" style={{ borderRadius: "8px", backgroundColor: "red", width: "80px", height: "30px" }} />
                <p>OR</p>
                <label>
                  <p>Customize your shortened link</p>
                  <input type="text" value={inputValue2} onChange={handleChange2} maxLength="48" style={{ height: "25px", borderRadius: "5px" }} />
                </label>
                <input type="submit" value="Submit2" style={{ borderRadius: "8px", backgroundColor: "red", width: "80px", height: "30px" }} />
                <br></br>
                <br></br>
              </div>
            </form>
            {data.length > 0 && (
              <div style={{ backgroundColor: "darkgray", border: "2px solid green", borderRadius: "10px", padding: "10px", maxWidth:"250px", wordBreak: "break-word", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <p>Original link:</p>
                <a href={data[data.length - 1].link} target="_blank" rel="noreferrer" style={{ wordBreak: "break-word" }}>{data[data.length - 1].link}</a>
                <p>Shortened link:</p>
                <a href={`https://localhost:7120/${data[data.length - 1].shortenedLink}`} target="_blank" rel="noreferrer" style={{ wordBreak: "break-word" }}>
                  {`https://localhost:7120/${data[data.length - 1].shortenedLink}`}
                </a>
                <button onClick={() => handleDelete(data[data.length - 1].id)} style={{ backgroundColor: "red", color: "white", borderRadius: "5px", marginTop: "10px", width:"100px", height:"30px"}}>Delete</button>
              </div>
            )}
          </div>
          <div style={{ flex: "11", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
            {data.slice(0, data.length - 1).reverse().map((item, index) => (
              <div key={index} style={{ backgroundColor: "lightblue", border: "2px solid green", borderRadius: "10px", padding: "10px", wordBreak: "break-word", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <p>Original link:</p>
                <a href={item.link} target="_blank" rel="noreferrer" style={{ wordBreak: "break-word" }}>{item.link}</a>
                <p>Shortened link:</p>
                <a href={`https://localhost:7120/${item.shortenedLink}`} target="_blank" rel="noreferrer" style={{ wordBreak: "break-word" }}>
                  {`https://localhost:7120/${item.shortenedLink}`}
                </a>
                <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: "red", color: "white", borderRadius: "5px", marginTop: "10px", width:"100px", height:"30px"}}>Delete</button>
              </div>
            ))}
          </div>
          </div>
      </div>
    </div>
  );
}

export default App;