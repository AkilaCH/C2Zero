import React from 'react';
import Accordion from 'react-bootstrap/Accordion';

const FaqAccordian = () => {
  return (
    <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0" className="faq-accordion-item mb-3">
        <Accordion.Header className="faq-accordion-header">How does this help at-risk children?</Accordion.Header>
        <Accordion.Body>
          <p className="my-3 small">This Christmas we are donating 15%* of every purchase to our friends at UnLtd. </p>
          <p className="mb-3 small">That's on top of the good you're already doing to help our planet! </p>
          <p className="font-italic small">*After processing fees and taxes.</p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1" className="faq-accordion-item mb-3">
        <Accordion.Header className="faq-accordion-header">
          What do these amounts look like in the real world?
        </Accordion.Header>
        <Accordion.Body>
          <h6 className="bold m-0">250KG</h6>
          <p className="mb-3 small">Average yearly city bus commute to work - 10km daily</p>

          <h6 className="bold m-0">500KG</h6>
          <p className="mb-3 small">Return flight Sydney to Melbourne (economy)!</p>

          <h6 className="bold m-0">1 Tonne</h6>
          <p className="mb-3 small">Average emission of a return-flight economy from Paris to New York</p>

          <h6 className="bold m-0"> 2 Tonnes</h6>
          <p className="mb-3 small">Driving an average petrol car 11,500 km</p>

          <h6 className="bold m-0">5 Tonnes</h6>
          <p className="mb-3 small">Return flight Sydney to London (economy)!</p>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2" className="faq-accordion-item mb-3">
        <Accordion.Header className="faq-accordion-header">What are emissions allowances?</Accordion.Header>
        <Accordion.Body>
          <p className="mb-3 small">
            Emissions Allowances regulate big polluters who operate in certain emissions trading schemes.
          </p>

          <p className="mb-3 small">
            We endeavour to source our Emissions Allowances from a range of schemes. This certificate is backed by New
            Zealand government regulated Emissions Allowances (NZUs) held in our vault CEDO. For more information about
            these allowances see https://www.epa.govt.nz/industry-areas/emissions-trading-scheme/
          </p>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default FaqAccordian;
