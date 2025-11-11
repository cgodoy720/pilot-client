import './FormClosed.css';

const FormClosed = ({ message }) => {
  return (
    <div className="form-closed">
      <div className="form-closed__container">
        <div className="form-closed__icon">🔒</div>
        <h1 className="form-closed__title">Form Not Available</h1>
        <p className="form-closed__message">
          {message || 'This form is not currently accepting responses.'}
        </p>
        <div className="form-closed__footer">
          <p className="form-closed__info">
            If you believe this is an error, please contact the form administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormClosed;

