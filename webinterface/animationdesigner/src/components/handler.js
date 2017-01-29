import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const Handler = ({ handler }) => {
  const { id, lights, name } = handler;

  return (
    <div className="Handler">
      <Link to={`configure/${id}`}>
        <h3>
          {id} {name && <span>({name})</span>} ({lights && lights.length})
        </h3>
      </Link>
    </div>
  );
}

Handler.propTypes = {
  handler: PropTypes.shape({
    id: PropTypes.string.isRequired,
    lights: PropTypes.string,
    name: PropTypes.string
  }).isRequired
};

export default Handler;
