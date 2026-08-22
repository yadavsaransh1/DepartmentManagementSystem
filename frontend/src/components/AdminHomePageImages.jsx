import React, { useState, useEffect } from 'react';
import '../styles/adminHomePageImages.css';
import { HOME_PAGE_ENDPOINTS } from '../config/api';

const AdminHomePageImages = () => {
  const [images, setImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: '',
    description: '',
    altText: '',
    displayOrder: 0,
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(HOME_PAGE_ENDPOINTS.ALL_HOME_PAGE_IMAGES, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Error loading images: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setMessage(`Error loading images: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.imageUrl) {
        setMessage('Please select an image');
        return;
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? HOME_PAGE_ENDPOINTS.HOME_PAGE_IMAGES_BY_ID(editingId)
        : HOME_PAGE_ENDPOINTS.ALL_HOME_PAGE_IMAGES;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage(editingId ? 'Image updated successfully' : 'Image uploaded successfully');
        setFormData({
          imageUrl: '',
          caption: '',
          description: '',
          altText: '',
          displayOrder: 0,
          isActive: true
        });
        setEditingId(null);
        setShowForm(false);
        fetchAllImages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving image:', error);
      setMessage(`Error saving image: ${error.message}`);
    }
  };

  const handleEdit = (image) => {
    setFormData({
      imageUrl: image.imageUrl,
      caption: image.caption || '',
      description: image.description || '',
      altText: image.altText || '',
      displayOrder: image.displayOrder || 0,
      isActive: image.isActive
    });
    setEditingId(image.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await fetch(HOME_PAGE_ENDPOINTS.HOME_PAGE_IMAGES_BY_ID(id), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setMessage('Image deleted successfully');
          fetchAllImages();
          setTimeout(() => setMessage(''), 3000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setMessage(`Error: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        setMessage(`Error deleting image: ${error.message}`);
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.HOME_PAGE_IMAGES_TOGGLE(id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMessage(currentStatus ? 'Image deactivated' : 'Image activated');
        fetchAllImages();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(`Error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error toggling image status:', error);
      setMessage(`Error updating image status: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      imageUrl: '',
      caption: '',
      description: '',
      altText: '',
      displayOrder: 0,
      isActive: true
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-home-page-images">
      <div className="admin-header">
        <h2>🖼️ Home Page Carousel Images</h2>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close' : '+ Add New Image'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="form-section">
          <form onSubmit={handleSubmit} className="image-form">
            <div className="form-group">
              <label>Image File:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                required
                className="file-input"
              />
              {formData.imageUrl && (
                <img src={formData.imageUrl} alt="Preview" className="image-preview" />
              )}
            </div>

            <div className="form-group">
              <label>Caption:</label>
              <input
                type="text"
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                placeholder="E.g., Welcome to Department"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the image"
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Alt Text:</label>
              <input
                type="text"
                name="altText"
                value={formData.altText}
                onChange={handleInputChange}
                placeholder="For accessibility"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Display Order:</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {editingId ? 'Update Image' : 'Upload Image'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="images-grid">
        {images.length === 0 ? (
          <p className="no-data">No carousel images yet. Add your first image!</p>
        ) : (
          images.map((image) => (
            <div key={image.id} className={`image-card ${!image.isActive ? 'inactive' : ''}`}>
              <div className="image-container">
                <img src={image.imageUrl} alt={image.altText} />
                {!image.isActive && <div className="inactive-badge">Inactive</div>}
              </div>
              <div className="image-details">
                <h4>{image.caption || 'No Caption'}</h4>
                <p className="description">{image.description || 'No description'}</p>
                <p className="order">Order: {image.displayOrder}</p>
                <div className="actions">
                  <button 
                    className="btn-toggle"
                    onClick={() => handleToggleActive(image.id, image.isActive)}
                  >
                    {image.isActive ? '👁️ Hide' : '👁️ Show'}
                  </button>
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(image)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(image.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminHomePageImages;
