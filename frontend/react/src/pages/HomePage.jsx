import { Link } from 'react-router-dom';
import {
  destinations,
  events,
  facts,
  foods,
  heritageItems,
  provinceRoles,
  timeline,
} from '../data/siteContent.js';
import { useRevealAnimation } from '../hooks/useRevealAnimation.js';

export function HomePage() {
  useRevealAnimation('home');

  return (
    <main>
      <section id="hero">
        <div className="hero-bg" />
        <div className="hero-grain" />
        <svg className="river-lines" viewBox="0 0 500 800" preserveAspectRatio="none" aria-hidden="true">
          <path d="M500,0 C380,120 420,260 320,360 C220,460 280,600 180,800" stroke="#c98a52" strokeWidth="1" fill="none" opacity="0.35" />
          <path d="M500,40 C400,160 460,300 360,400 C260,500 320,640 220,800" stroke="#c98a52" strokeWidth="1" fill="none" opacity="0.22" />
          <path d="M500,-40 C360,90 380,230 280,330 C180,430 240,580 140,800" stroke="#c98a52" strokeWidth="1" fill="none" opacity="0.18" />
        </svg>
        <div className="hero-content">
          <p className="hero-eyebrow">Land of Rolling Hills and Wide Shore Lands</p>
          <h1 className="hero-title">Batangas</h1>
          <div className="hero-actions">
            <Link to="/#origin" className="hero-cta">Explore</Link>
          </div>
        </div>
        <div className="hero-foot">
          <span className="hero-coords">13.9750° N, 121.0220° E - Taal Lake</span>
        </div>
      </section>


      <section id="origin">
        <div className="origin-art reveal">
          <svg className="batang-rings" viewBox="0 0 380 380" fill="none" aria-hidden="true">
            <circle cx="190" cy="190" r="170" stroke="#8a5a36" strokeWidth="1.5" opacity="0.25" />
            <circle cx="190" cy="190" r="138" stroke="#8a5a36" strokeWidth="1.5" opacity="0.35" />
            <circle cx="190" cy="190" r="106" stroke="#8a5a36" strokeWidth="1.5" opacity="0.5" />
            <circle cx="190" cy="190" r="74" stroke="#8a5a36" strokeWidth="1.5" opacity="0.7" />
            <circle cx="190" cy="190" r="42" stroke="#b3402f" strokeWidth="2" />
            <circle cx="190" cy="190" r="10" fill="#b3402f" />
            <path d="M40,120 L340,120" stroke="#103c3c" strokeWidth="0.6" opacity="0.3" />
            <path d="M30,250 L350,250" stroke="#103c3c" strokeWidth="0.6" opacity="0.3" />
          </svg>
          <p className="origin-caption">
            A cross-section inspired by the batang, the floating logs that gave the riverside settlement its name.
          </p>
        </div>
        <div className="origin-text reveal reveal-delay-1">
          <p className="section-eyebrow">Where the Name Came From</p>
          <h2 className="section-title">Batangan, then Batangas</h2>
          <p className="section-body">
            Spanish missionaries reached this coast in 1572. When the settlement was founded in 1581,
            the Calumpang River was known for large floating logs called batang. The barangay became
            Batangan, later softened to Batangas.
          </p>
          <div className="timeline">
            {timeline.map((item) => (
              <div key={item.year} className="tl-item">
                <div className="tl-year">{item.year}</div>
                <div className="tl-text">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about">
        <div className="about-grid">
          <div className="about-image-wrap reveal">
            <img src="/images/destinations/basilica.jpg" alt="Basilica architecture in Batangas province" />
            <div className="about-image-label">Baroque-era basilica architecture, Batangas province</div>
          </div>
          <div className="about-text reveal reveal-delay-1">
            <p className="section-eyebrow">Rich in Culture and Devotion</p>
            <h2 className="section-title">A History of Resiliency and Faith</h2>
            <p className="section-body">
              Batangas province has long been a center of faith, agriculture, and resistance against colonial rule.
              Its identity is forged by historical landmarks, old stone churches, and a people renowned for their
              distinct Tagalog dialect, warm hospitality, and revolutionary spirit.
            </p>
            <div className="heritage-list">
              {heritageItems.map((item) => (
                <div key={item.year} className="heritage-row">
                  <div className="heritage-year">{item.year}</div>
                  <div>
                    <div className="heritage-name">{item.name}</div>
                    <div className="heritage-desc">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="role">
        <div className="section-head reveal">
          <p className="section-eyebrow">What the Province Represents</p>
          <h2 className="section-title">A Land of Valor and Growth</h2>
          <p className="section-body">
            Batangas Province is a cornerstone of Philippine heritage, an economic dynamo, and a sanctuary of natural beauty.
          </p>
        </div>
        <div className="role-grid">
          {provinceRoles.map((role, index) => (
            <article key={role.title} className={`role-card reveal reveal-delay-${index}`}>
              <div className="role-num">{role.number} / {role.label}</div>
              <div className="role-title">{role.title}</div>
              <div className="role-desc">{role.text}</div>
            </article>
          ))}
        </div>
      </section>

      <section id="destinations">
        <div className="section-head reveal">
          <p className="section-eyebrow">Across the Province</p>
          <h2 className="section-title">Wonders of Batangas</h2>
          <p className="section-body">
            From breathtaking coastal dive spots and pristine beaches to historic heritage towns and volcano landscapes.
          </p>
        </div>
        <div className="dest-grid">
          {destinations.map((destination) => (
            <article key={destination.name} className={`dest-card reveal ${destination.tall ? 'tall' : ''}`}>
              <img src={destination.image} alt={destination.name} />
              <div className="dest-overlay">
                <div className="dest-tag">{destination.tag}</div>
                <div className="dest-name">{destination.name}</div>
                <div className="dest-desc">{destination.text}</div>
              </div>
            </article>
          ))}
        </div>

        <div className="how-to-get reveal">
          <div className="how-title">How to Get to Batangas Province</div>
          <div className="how-routes">
            <div className="route">
              <div className="route-icon" aria-hidden="true">BUS</div>
              <div className="route-info">
                <h4>By Bus from Manila</h4>
                <p>Buses from Manila (Buendia, Cubao) regularly route to key provincial hubs like Batangas City, Lipa, and Lemery.</p>
              </div>
            </div>
            <div className="route">
              <div className="route-icon" aria-hidden="true">CAR</div>
              <div className="route-info">
                <h4>By Car via STAR Tollway</h4>
                <p>Take SLEX and connect to the STAR Tollway to easily access different municipalities and coastal towns across the province.</p>
              </div>
            </div>
            <div className="route">
              <div className="route-icon" aria-hidden="true">SEA</div>
              <div className="route-info">
                <h4>By Sea via Provincial Ports</h4>
                <p>Aside from the main Batangas Port, various local ports connect mainland Batangas to the neighboring islands of Mindoro and Marinduque.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="food">
        <div className="section-head reveal">
          <p className="section-eyebrow">Food and Delicacies</p>
          <h2 className="section-title">A Province You Can Taste</h2>
          <p className="section-body">
            Batangueño culinary heritage is rich and comforting, from thick savory soups to robust locally-grown coffee.
          </p>
        </div>
        <div className="food-grid">
          {foods.map((food, index) => (
            <article key={food.name} className={`food-card reveal reveal-delay-${index}`}>
              <img className="food-img" src={food.image} alt={food.name} />
              <div className="food-body">
                <div className="food-name">{food.name}</div>
                <p className="food-desc">{food.text}</p>
                <span className="food-badge">{food.badge}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="events">
        <div className="section-head reveal">
          <p className="section-eyebrow">Events and Gallery</p>
          <h2 className="section-title">The Batangueno Calendar</h2>
          <p className="section-body">
            Faith, civic history, and province-wide craft traditions shape the festival calendar.
          </p>
        </div>
        <div className="events-layout">
          <div className="event-list">
            {events.map((event, index) => (
              <article key={event.title} className={`event-item reveal reveal-delay-${index}`}>
                <div className="event-date">
                  <div className="event-month">{event.month}</div>
                  <div className="event-day">{event.day}</div>
                </div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p>{event.text}</p>
                  <div className="event-location">{event.location}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="gallery-grid reveal">
            {destinations.slice(0, 4).map((destination, index) => (
              <div key={destination.name} className={index === 0 || index === 3 ? 'gallery-item wide' : 'gallery-item'}>
                <img src={destination.image} alt={destination.name} />
                <div className="gallery-item-label">{destination.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="visit">
        <div className="section-head reveal">
          <p className="section-eyebrow">Practical Info and Travel</p>
          <h2 className="section-title">Visiting the Province</h2>
          <p className="section-body">
            Secure accommodation and transport options for your Batangas travel.
          </p>
        </div>
        <div className="visit-grid">
          <article className="visit-card reveal">
            <h4>Accommodations and Stays</h4>
            <p>Explore apartments and rooms in and around the city to plan your stay.</p>
            <Link to="/listings?category=Apartment" className="hero-cta">Book a Stay</Link>
          </article>
          <article className="visit-card reveal reveal-delay-1">
            <h4>Transport and Car Rentals</h4>
            <p>Rent a sedan or SUV to explore coastal roads and heritage towns.</p>
            <Link to="/listings?category=Car" className="hero-cta">Rent a Vehicle</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
