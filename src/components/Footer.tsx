import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #ffffff;
  padding: 10px 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
  border-top: 1px solid #e1e5e9;
`;

const Footer: React.FC = () => (
  <FooterContainer>
    © {new Date().getFullYear()} Windexs Cloud. All rights reserved.
  </FooterContainer>
);

export default Footer;



