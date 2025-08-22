import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { CreateArtworkModal } from "../molecules";

const DiscoverIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
);

const NFTsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="7" y="7" width="4" height="4" fill="currentColor"/>
        <rect x="13" y="7" width="4" height="4" fill="currentColor"/>
        <rect x="7" y="13" width="4" height="4" fill="currentColor"/>
        <rect x="13" y="13" width="4" height="4" fill="currentColor"/>
    </svg>
);

const ActivityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="2"/>
        <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2"/>
        <line x1="7" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2"/>
    </svg>
);

const RewardsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
);

const StudioIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
);

const ProfileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
);

const ResourcesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
);

const SupportIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2"/>
    </svg>
);

const VotingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M12 3v6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M12 15v6" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
);

const SidebarContainer = styled.div`
    height: 100%;
    padding: 0;
    color: #ffffff;
    width: ${props => props.isExpanded ? '240px' : '64px'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
    background: #0d1017;
    border-right: 1px solid #2a2a2a;
    min-width: ${props => props.isExpanded ? '240px' : '64px'};
    pointer-events: auto;
`;

const LogoContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #0d1017;
    
    &:hover {
        background: rgba(139, 92, 246, 0.1);
    }
`;

const LogoIcon = styled.div`
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
`;

const LogoText = styled.span`
    font-size: 20px;
    font-weight: 800;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: ${props => props.isExpanded ? '1' : '0'};
    transform: ${props => props.isExpanded ? 'translateX(0)' : 'translateX(-10px)'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    overflow: hidden;
    letter-spacing: -0.5px;
    visibility: ${props => props.isExpanded ? 'visible' : 'hidden'};
    width: ${props => props.isExpanded ? 'auto' : '0'};
`;



const Navigation = styled.nav`
    padding: 0 16px;
    min-width: 240px;
    margin-top: 0;
`;

const NavItem = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 8px;
    color: ${props => props.active ? '#ffffff' : '#8b949e'};
    font-size: 14px;
    font-weight: ${props => props.active ? '600' : '400'};
    cursor: pointer;
    transition: all 0.2s ease;
    gap: 12px;
    white-space: nowrap;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    border-radius: 8px;
    margin: 2px 0;

    &:hover {
        color: #ffffff;
        background: rgba(139, 92, 246, 0.1);
    }
`;

const NavIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: currentColor;
`;

const NavText = styled.span`
    opacity: ${props => props.isExpanded ? '1' : '0'};
    transform: ${props => props.isExpanded ? 'translateX(0)' : 'translateX(-10px)'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    overflow: hidden;
    visibility: ${props => props.isExpanded ? 'visible' : 'hidden'};
    width: ${props => props.isExpanded ? 'auto' : '0'};
`;

const Divider = styled.div`
    height: 1px;
    background-color: #2a2a2a;
    margin: 16px 8px;
    min-width: 240px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 8px;
  
  &:hover {
    background: rgba(139, 92, 246, 0.1);
  }
  
  ${props => props.active && `
    background: rgba(139, 92, 246, 0.15);
    border-left: 3px solid #8b5cf6;
  `}
`;

const MenuText = styled.span`
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#8b5cf6' : '#8b949e'};
  white-space: nowrap;
  opacity: ${props => props.isExpanded ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const Sidebar = ({ isExpanded }) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleStudioClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleOptionSelect = (option) => {
        setIsModalOpen(false);
        if (option === 'ai-draft') {
            navigate('/ai-draft');
        } else if (option === 'blank-canvas') {
            navigate('/blank-canvas');
        }
    };

    return (
        <>
            <SidebarContainer isExpanded={isExpanded}>
                <LogoContainer onClick={() => window.location.href = '/'}>
                    <LogoIcon>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            {/* 간단한 팔레트 */}
                            <rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>
                            <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                            <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
                            <circle cx="9" cy="15" r="1.5" fill="currentColor"/>
                            <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
                        </svg>
                    </LogoIcon>
                    <LogoText isExpanded={isExpanded}>AixelLab</LogoText>
                </LogoContainer>
                <Navigation>
                    <NavItem active={true}>
                        <NavIcon>
                            <DiscoverIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Discover</NavText>
                    </NavItem>
                    <NavItem onClick={() => navigate('/nfts')}>
                        <NavIcon>
                            <NFTsIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>NFTs</NavText>
                    </NavItem>
                    <NavItem>
                        <NavIcon>
                            <ActivityIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Activity</NavText>
                    </NavItem>
                    <NavItem>
                        <NavIcon>
                            <RewardsIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Rewards</NavText>
                    </NavItem>
                    <NavItem onClick={handleStudioClick}>
                        <NavIcon>
                            <StudioIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Studio</NavText>
                    </NavItem>
                    <NavItem onClick={() => navigate('/voting')}>
                        <NavIcon>
                            <VotingIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Voting</NavText>
                    </NavItem>
                    <NavItem onClick={() => navigate('/profile')}>
                        <NavIcon>
                            <ProfileIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Profile</NavText>
                    </NavItem>
                </Navigation>

                <Divider />

                <Navigation>
                    <NavItem>
                        <NavIcon>
                            <ResourcesIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Resources</NavText>
                    </NavItem>
                    <NavItem>
                        <NavIcon>
                            <SettingsIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Settings</NavText>
                    </NavItem>
                    <NavItem>
                        <NavIcon>
                            <SupportIcon />
                        </NavIcon>
                        <NavText isExpanded={isExpanded}>Support</NavText>
                    </NavItem>
                </Navigation>
            </SidebarContainer>
            
            {isModalOpen && (
                <CreateArtworkModal 
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSelectOption={handleOptionSelect}
                />
            )}
        </>
    );
};

export default Sidebar; 