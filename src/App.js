import { useState, useEffect } from 'react';
import './App.scss';


function App() {
	const initialNumbersLeft = localStorage.getItem('secondsLeft');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [currentUser, setCurrentUser] = useState({});
	const [message, setMessage] = useState('Welcome');
	const [secondsLeft, setSecondsLeft] = useState(initialNumbersLeft ? initialNumbersLeft : 0);
	const [showSite, setShowSite] = useState(false);

	useEffect(() => {
		(async () => {
			const response = await fetch('http://localhost:5001/maintain-login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'authorization': 'Bearer ' + localStorage.getItem('token')
				}
			});
			if (response.ok) {
				const data = await response.json();
				setCurrentUser(prev => ({ ...prev, ...data.user }));
				const _secondsLeft = Number(localStorage.getItem('secondsLeft'));
				setSecondsLeft(prev => _secondsLeft);
				setShowSite(true);
				setInterval(() => {
					setSecondsLeft(prev => prev - 1);
				}, 1000);
			} else {
				setShowSite(true);
			}
		})();
	}, []);

	useEffect(() => {
		localStorage.setItem('secondsLeft', secondsLeft);
		if (secondsLeft === -1) {
			window.location.reload(false);
		}
	}, [secondsLeft]);

	const handleUsername = (e) => {
		setUsername(e.target.value);
	}

	const handlePassword = (e) => {
		setPassword(e.target.value);
	}

	const handleButton = async () => {
		const response = await fetch('http://localhost:5001/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		setUsername('');
		setPassword('');
		if (response.ok) {
			const data = await response.json();
			setCurrentUser(prev => ({ ...prev, ...data.user }));
			localStorage.setItem('token', data.token);
			setMessage(`User: ${currentUser.firstName}`);
			setSecondsLeft(20);
			localStorage.setItem('secondsLeft', 20);
			setInterval(() => {
				setSecondsLeft(prev => prev - 1);
			}, 1000);
		} else {
			setMessage('bad login');
		}
	}

	return (
		<div className="App">
			{showSite && (
				<>
					<hr />
					{Object.keys(currentUser).length === 0 && (
						<div>{message}</div>
					)}
					{Object.keys(currentUser).length > 0 && secondsLeft >= 0 && (
						<div>
							{currentUser.firstName} {currentUser.lastName} ({secondsLeft}s)
						</div>
					)}
					<hr />

					{Object.keys(currentUser).length === 0 && (
						<form >
							<div className="row">
								username: <input onChange={handleUsername} value={username} type="text" />
							</div>
							<div className="row">
								password: <input onChange={handlePassword} value={password} type="password" />
							</div>
							<div className="row">
								<button type="button" onClick={handleButton}>Login</button>
							</div>
						</form>
					)
					}
				</>
			)}
		</div >
	);
}

export default App;