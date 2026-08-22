import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/homePage.css';
import '../styles/carousel.css';
import NoticeBoard from '../components/NoticeBoard';
import { HOME_PAGE_ENDPOINTS } from '../config/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [homePageContent, setHomePageContent] = useState(null);
  const [carouselImages, setCarouselImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [faculty, setFaculty] = useState([]);
  const [teachingAssistants, setTeachingAssistants] = useState([]);
  const [technicalStaff, setTechnicalStaff] = useState([]);
  const [nonTeachingEmployees, setNonTeachingEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null); // null = main page, 'faculty', 'teaching', 'technical', 'nonteaching'
  const [expandedDescriptions, setExpandedDescriptions] = useState({}); // Track expanded descriptions by id

  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderDescription = (text, id, maxLength = 100) => {
    if (!text) return null;
    const isExpanded = expandedDescriptions[id];
    const shouldShowMore = text.length > maxLength;
    
    return (
      <div>
        <p className="category-description">
          {isExpanded ? text : text.substring(0, maxLength) + (shouldShowMore ? '...' : '')}
        </p>
        {shouldShowMore && (
          <button 
            className="read-more"
            onClick={() => toggleDescription(id)}
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        )}
      </div>
    );
  };

  // Carousel auto-slide effect
  useEffect(() => {
    if (carouselImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [carouselImages]);

  useEffect(() => {
    fetchHomePageContent();
    fetchCarouselImages();
    fetchFaculty();
    fetchTeachingAssistants();
    fetchTechnicalStaff();
    fetchNonTeachingEmployees();
  }, []);

  const fetchHomePageContent = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.CONTENT);
      if (response.ok) {
        const data = await response.json();
        setHomePageContent(data);
      }
    } catch (error) {
      console.error('Error fetching home page content:', error);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.CAROUSEL_IMAGES);
      if (response.ok) {
        const data = await response.json();
        setCarouselImages(data);
      }
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.FACULTY);
      if (response.ok) {
        const data = await response.json();
        setFaculty(data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachingAssistants = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.TEACHING_ASSISTANT);
      if (response.ok) {
        const data = await response.json();
        setTeachingAssistants(data);
      }
    } catch (error) {
      console.error('Error fetching teaching assistants:', error);
    }
  };

  const fetchTechnicalStaff = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.TECHNICAL_STAFF);
      if (response.ok) {
        const data = await response.json();
        setTechnicalStaff(data);
      }
    } catch (error) {
      console.error('Error fetching technical staff:', error);
    }
  };

  const fetchNonTeachingEmployees = async () => {
    try {
      const response = await fetch(HOME_PAGE_ENDPOINTS.NON_TEACHING_EMPLOYEE);
      if (response.ok) {
        const data = await response.json();
        setNonTeachingEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching non-teaching employees:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const renderCategoryPage = (category, data, categoryName) => {
    return (
      <div className="category-page">
        <div className="category-header">
          <button className="back-btn" onClick={() => setActiveCategory(null)}>← Back</button>
          <h2>{categoryName}</h2>
        </div>
        {data.length === 0 ? (
          <p className="no-data">No {categoryName.toLowerCase()} available.</p>
        ) : (
          <div className="category-grid">
            {data.map((member) => (
              <div key={member.id} className="category-card">
                {member.image && (
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="category-image"
                  />
                )}
                <div className="category-info">
                  <h4>{member.name}</h4>
                  <p className="category-designation">{member.designation}</p>
                  {member.qualification && <p className="category-qualification">Qualification: {member.qualification}</p>}
                  {member.specialization && <p className="category-qualification">Specialization: {member.specialization}</p>}
                  {member.department && <p className="category-qualification">Department: {member.department}</p>}
                  {renderDescription(member.description, `category-${member.id}`)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // if (loading) {
  //   return <div className="loading">Loading...</div>;
  // }

  // Show category page if a category is selected
  if (activeCategory === 'faculty') {
    return (
      <div className="home-page">
        <div className="header">
          <h1>Department Management System</h1>
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
        <div className="home-container">
          {renderCategoryPage('faculty', faculty, 'Faculty')}
        </div>
      </div>
    );
  }
  if (activeCategory === 'teaching') {
    return (
      <div className="home-page">
        <div className="header">
          <h1>Department Management System</h1>
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
        <div className="home-container">
          {renderCategoryPage('teaching', teachingAssistants, 'Teaching Assistants')}
        </div>
      </div>
    );
  }
  if (activeCategory === 'technical') {
    return (
      <div className="home-page">
        <div className="header">
          <h1>Department Management System</h1>
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
        <div className="home-container">
          {renderCategoryPage('technical', technicalStaff, 'Technical Staff')}
        </div>
      </div>
    );
  }
  if (activeCategory === 'nonteaching') {
    return (
      <div className="home-page">
        <div className="header">
          <h1>Department Management System</h1>
          <button className="login-btn" onClick={handleLogin}>Login</button>
        </div>
        <div className="home-container">
          {renderCategoryPage('nonteaching', nonTeachingEmployees, 'Non-Teaching Employees')}
        </div>
      </div>
    );
  }

  // Main home page
  return (
    <div className="home-page">
      {/* Header */}
      <div className="header">
      <div className="header-left">
        {homePageContent?.departmentLogo && (
          <img 
            src={homePageContent.departmentLogo} 
            alt={homePageContent?.logoAltText || 'Department Logo'} 
            className="department-logo"
          />
        )}
      </div>

      {/* NEW WRAPPER */}
      <div className="header-right">
        <h1 className="header-title">Department Management System</h1>
        <button className="login-btn" onClick={handleLogin}>Login</button>
      </div>
    </div>

      {/* Main Content */}
      <div className="home-container">
        {/* Auto-sliding Carousel */}
        {carouselImages.length > 0 && (
          <div className="carousel-section">
            <div className="carousel-container">
              <div className="carousel-slides">
                {carouselImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText || image.caption || 'Carousel Image'}
                      className="carousel-image"
                    />
                    {image.caption && (
                      <div className="carousel-caption">
                        <h3>{image.caption}</h3>
                        {image.description && <p>{image.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <button className="carousel-btn carousel-prev" onClick={handlePrevSlide}>
                ❮
              </button>
              <button className="carousel-btn carousel-next" onClick={handleNextSlide}>
                ❯
              </button>

              {/* Carousel Indicators */}
              <div className="carousel-indicators">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Department Section */}
        <div className="department-section">
          {homePageContent?.departmentImage && (
            <img 
              src={homePageContent.departmentImage} 
              alt="Department" 
              className="department-image"
            />
          )}
          <div className="department-info">
            <h2>{homePageContent?.departmentTitle || 'About the Department'}</h2>
            {renderDescription(homePageContent?.departmentDescription || ' The Department of Computer Science was established in 2005, with a diploma course of one-year duration, and a three-year undergraduate course, Bachelor of Computer Applications (BCA). The first and second batch of the BCA programme has completed and the third batch has started from the session 2008-2009, starting from July, 2008. In the year 2006 the Master of Technology in Computer Science and Engineering was started in the department. The department has started the Master of Computer Application course from the session 2013-14.', 'department', 120)}
          </div>
        </div>

        {/* Dean and HoD Section */}
        <div className="personnel-section">
          {/* Dean Card */}
          <div className="personnel-card">
            {homePageContent?.deanImage && (
              <img 
                src={homePageContent.deanImage} 
                alt={homePageContent?.deanName || 'Dean'} 
                className="personnel-image"
              />
            )}
            <div className="personnel-content">
              <h3 className="role-title">Dean</h3>
              <h4>{homePageContent?.deanName || ''}</h4>
              <p className="designation">{homePageContent?.deanDesignation || 'Professor'}</p>
              {renderDescription(homePageContent?.deanDescription || 'The Dean of Faculty is a senior academic authority overseeing multiple departments, formulating policies, allocating resources, promoting collaboration, ensuring quality standards, representing the institution, driving strategic vision, empowering growth, and nurturing an environment of academic excellence and innovation.', 'dean', 80)}
            </div>
          </div>

          {/* HoD Card */}
          <div className="personnel-card">
            {homePageContent?.hodImage && (
              <img 
                src={homePageContent.hodImage} 
                alt={homePageContent?.hodName || 'HoD'} 
                className="personnel-image"
              />
            )}
            <div className="personnel-content">
              <h3 className="role-title">Head of Department</h3>
              <h4>{homePageContent?.hodName || ''}</h4>
              <p className="designation">{homePageContent?.hodDesignation || 'Professor'}</p>
              {renderDescription(homePageContent?.hodDescription || 'The Head of Department is the academic leader responsible for guiding faculty, managing curriculum, fostering research, supporting students, ensuring discipline, encouraging innovation, maintaining standards, and inspiring excellence through vision, dedication, and collaborative leadership.', 'hod', 80)}
            </div>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="buttons-section">
          <div className="buttons-grid">
            <button className="category-nav-btn faculty-btn" onClick={() => setActiveCategory('faculty')}>
              <span className="btn-icon">👥</span>
              <span>Faculty</span>
            </button>
            <button className="category-nav-btn teaching-assist-btn" onClick={() => setActiveCategory('teaching')}>
              <span className="btn-icon">🎓</span>
              <span>Teaching Assistants</span>
            </button>
            <button className="category-nav-btn technical-staff-btn" onClick={() => setActiveCategory('technical')}>
              <span className="btn-icon">🔧</span>
              <span>Technical Staff</span>
            </button>
            <button className="category-nav-btn non-teaching-btn" onClick={() => setActiveCategory('nonteaching')}>
              <span className="btn-icon">💼</span>
              <span>Non-Teaching Employees</span>
            </button>
          </div>
        </div>

        {/* Notice Board Section */}
        <NoticeBoard />
      </div>
        <div className="marquee">
          <span>
            Dr. Rahul Chandra Kushwaha,
            Dr. Rupam Kumar Sharma,
            Mr. Mainong Jenbum Singpho,
            <strong>  © Saransh Yadav </strong>
            Ms. Priyanka Yadav, 
            Dr. Bomken Kamdak, 
            Dr. Bhaskar Jyoti Chutia
        </span>
      </div>
    </div>
  );
};

export default HomePage;
