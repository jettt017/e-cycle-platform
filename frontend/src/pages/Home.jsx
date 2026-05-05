import React from "react";
import { Link } from "react-router-dom";
import {
  Recycle,
  MapPin,
  Calculator,
  Leaf,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import heroImg from "../assets/hero.png";

function Home() {
  return (
    <>
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <h1>
            Your Old
            <div className="hero-img-container">
              <img src={heroImg} alt="Person holding recycled phone" />
            </div>
            Gadgets
            <br />
            Are Valuable
          </h1>

          <div className="hero-actions">
            <Link to="/drop-points" className="pill-btn">
              Find Drop-Point
            </Link>
            <Link to="/estimator" className="action-link">
              Estimate Value <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {/* Stats Banner */}
        <div className="stats-banner">
          <div className="stat-item">
            <Recycle size={20} color="var(--primary)" />
            <span>2.4M Tons E-Waste / Year</span>
          </div>
          <div className="stat-item">
            <Leaf size={20} color="var(--primary)" />
            <span>Eco-Friendly Processing</span>
          </div>
          <div className="stat-item">
            <Calculator size={20} color="var(--primary)" />
            <span>Transparent Valuation</span>
          </div>
          <div className="stat-item">
            <MapPin size={20} color="var(--primary)" />
            <span>500+ Drop Points</span>
          </div>
        </div>

        {/* Features / Cards Section */}
        <section className="cards-grid">
          {/* Card 1 */}
          <div className="card highlight">
            <span className="tag-badge">Smart Drop</span>
            <div className="card-icon">
              <MapPin size={20} color="var(--primary)" />
            </div>
            <h3>Smart Drop-Point Finder</h3>
            <p>
              Locate the nearest official e-waste drop points with real-time
              operating hours and accepted device lists.
            </p>
            <div className="card-footer">
              <div className="brands">
                <span
                  style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                >
                  Samsung • Apple • Asus
                </span>
              </div>
              <Link
                to="/drop-points"
                className="icon-btn"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                  borderColor: "var(--primary)",
                }}
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card">
            <span
              className="tag-badge"
              style={{
                backgroundColor: "rgba(0,0,0,0.05)",
                color: "var(--text-main)",
              }}
            >
              AI Driven
            </span>
            <div className="card-icon">
              <Calculator size={20} />
            </div>
            <h3>E-Waste Estimator</h3>
            <p>
              Get instant valuation for your used devices based on real-time
              market data and give them a second life.
            </p>
            <div className="card-footer">
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Check Value
              </span>
              <Link to="/estimator" className="icon-btn">
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card">
            <span
              className="tag-badge"
              style={{
                backgroundColor: "rgba(0,0,0,0.05)",
                color: "var(--text-main)",
              }}
            >
              Logistics
            </span>
            <div className="card-icon">
              <Recycle size={20} />
            </div>
            <h3>Pickup Scheduling</h3>
            <p>
              Can't make it to a drop point? Schedule a home pickup with our
              verified eco-logistics partners.
            </p>
            <div className="card-footer">
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Book a Ride
              </span>
              <Link to="/pickup" className="icon-btn">
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="container">
          <span
            className="tag-badge"
            style={{
              backgroundColor: "rgba(0,0,0,0.05)",
              color: "var(--text-main)",
            }}
          >
            Our Impact
          </span>
          <h2>
            Together, We're Making
            <br />A Difference
          </h2>
          <div className="impact-number">12,450</div>
          <p
            style={{
              fontWeight: 600,
              fontSize: "1.2rem",
              marginBottom: "2rem",
            }}
          >
            Kg of E-Waste Recycled Successfully
          </p>
          <Link to="/impact" className="pill-btn outline">
            View Full Impact Dashboard
          </Link>
        </div>
      </section>
    </>
  );
}

export default Home;
