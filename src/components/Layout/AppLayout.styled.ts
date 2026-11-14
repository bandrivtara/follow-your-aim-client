import styled from "@emotion/styled";

const StyledLayout = styled.div`
  min-height: 100vh;

  .site-layout {
    padding: 20px 10px;
  }

  .mobile-layout {
    min-height: 100vh;
    background: #faf7f2;
  }

  .mobile-app-header {
    position: sticky;
    z-index: 20;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 60px;
    padding: env(safe-area-inset-top) 14px 0;
    border-bottom: 1px solid #ebe3da;
    background: rgba(250, 247, 242, 0.96);
    backdrop-filter: blur(14px);
  }

  .mobile-app-header > div {
    display: grid;
    line-height: 1.15;
  }

  .mobile-app-kicker {
    color: #75675b;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mobile-content {
    margin: 0;
    padding: 0 12px calc(88px + env(safe-area-inset-bottom));
  }

  .mobile-bottom-navigation {
    position: fixed;
    z-index: 30;
    right: 0;
    bottom: 0;
    left: 0;
    height: calc(68px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid #e6ded5;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 -8px 24px rgba(64, 48, 35, 0.08);
  }

  .mobile-bottom-navigation .MuiBottomNavigationAction-root {
    min-width: 0;
    padding: 7px 2px;
  }

  .mobile-bottom-navigation .MuiBottomNavigationAction-label {
    font-size: 0.68rem;
  }
`;

export default StyledLayout;
