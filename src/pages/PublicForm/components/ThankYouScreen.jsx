import './ThankYouScreen.css';
import logo from '../../../assets/logo-full.png';

const ThankYouScreen = ({ message }) => {
  return (
    <div className="thank-you-screen">
      <div className="thank-you-screen__container">
        <div className="thank-you-screen__icon">✓</div>
        <h1 className="thank-you-screen__title">Thank you!</h1>
        <p className="thank-you-screen__message">
          {message || 'Your response has been recorded.'}
        </p>
      </div>
      <img src={logo} alt="Pursuit" className="thank-you-screen__logo" />
    </div>
  );
};

export default ThankYouScreen;
