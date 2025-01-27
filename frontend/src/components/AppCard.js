import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Chip,
  alpha,
  CircularProgress,
  Fade,
  Zoom,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Download as DownloadIcon,
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Update as UpdateIcon,
  ArrowUpward as ArrowUpwardIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Terminal as TerminalIcon
} from '@mui/icons-material';
import { installationService } from '../api/installationService';
import './AppCard.css';

const AppCard = ({ 
  id,
  name, 
  developer, 
  description, 
  icon,
  onCardClick
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showUpdateAnimation, setShowUpdateAnimation] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [versions, setVersions] = useState({ current: null, latest: null });
  const [error, setError] = useState(null);

  const isVSCode = id === 'visual-studio-code';
  const isNode = id === 'node';

  const getMainVersion = (version) => 
    version ? version.split(/[-+]/)[0] : version;

  const handleCheckUpdate = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (isVSCode || id === 'postman') return; // VS Code and Postman handle their own updates

    setCheckingUpdate(true);
    setError(null);
    try {
      // Only check for updates if the app is installed
      if (isInstalled) {
        const result = await installationService.checkForUpdates(id);
        console.log('Update check result:', result);
        
        const hasNewerVersion = result.currentVersion && result.latestVersion && 
          result.currentVersion !== result.latestVersion &&
          result.latestVersion.localeCompare(result.currentVersion, undefined, { numeric: true }) > 0;
        
        setUpdateAvailable(Boolean(hasNewerVersion));
        setVersions({
          current: result.currentVersion,
          latest: result.latestVersion
        });
        
        if (hasNewerVersion) {
          setShowUpdateAnimation(true);
          setTimeout(() => setShowUpdateAnimation(false), 1000);
        }
      } else {
        // Reset update states if app is not installed
        setUpdateAvailable(false);
        setVersions({ current: null, latest: null });
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setError('Failed to check for updates');
      // Reset states on error
      setUpdateAvailable(false);
      setVersions({ current: null, latest: null });
    } finally {
      setCheckingUpdate(false);
      handleMenuClose();
    }
  }, [id, isVSCode, isInstalled]);

  const checkInstallation = useCallback(async () => {
    try {
      console.log('Checking installation for:', id);
      const installed = await installationService.checkInstallation(id);
      console.log('Installation status:', installed);
      
      // Update installation status
      setIsInstalled(installed);
      
      // Check for updates only if installed and not VS Code
      if (installed && !isVSCode) {
        await handleCheckUpdate();
      } else {
        // Reset update states if not installed
        setVersions({ current: null, latest: null });
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error checking installation:', error);
      setError('Failed to check installation status');
      // Reset states on error
      setIsInstalled(false);
      setVersions({ current: null, latest: null });
      setUpdateAvailable(false);
    }
  }, [id, isVSCode, handleCheckUpdate]);

  useEffect(() => {
    checkInstallation();
  }, [checkInstallation]);

  const handleMenuClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setUpdateProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    return interval;
  };

  const handleInstall = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('Installing:', id);
    setInstalling(true);
    setError(null);
    const progressInterval = simulateProgress();

    try {
      const result = await installationService.installApp(id);
      console.log('Installation result:', result);
      
      // Recheck installation status
      const installed = await installationService.checkInstallation(id);
      setIsInstalled(installed);
      
      if (installed) {
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
        if (!isVSCode) {
          await handleCheckUpdate();
        }
      } else {
        throw new Error('Installation verification failed');
      }
    } catch (error) {
      console.error('Installation error:', error);
      setError(error instanceof Error ? error.message : 'Installation failed');
      setIsInstalled(false);
    } finally {
      clearInterval(progressInterval);
      setUpdateProgress(0);
      setInstalling(false);
    }
  };

  const handleUpdate = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isVSCode) return;

    setUpdating(true);
    setError(null);
    const progressInterval = simulateProgress();

    try {
      await installationService.updateApp(id);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      
      const result = await installationService.checkForUpdates(id);
      console.log('Post-update version check:', result);
      
      setUpdateAvailable(Boolean(result.hasUpdate));
      setVersions({
        current: result.currentVersion,
        latest: result.latestVersion
      });
    } catch (error) {
      console.error('Update error:', error);
      setError(error instanceof Error ? error.message : 'Update failed');
    } finally {
      clearInterval(progressInterval);
      setUpdateProgress(0);
      setUpdating(false);
      handleMenuClose();
    }
  };

  const handleErrorClose = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setError(null);
  };

  const isLoading = installing || updating;
  const progress = isLoading ? updateProgress : 0;

  const handleButtonClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Button clicked for:', id);
    console.log('Current state:', {
      isInstalled,
      updateAvailable,
      isVSCode,
      isNode,
      isLoading: installing || updating
    });
    
    if (updateAvailable && !isVSCode && !isNode) {
      console.log('Handling update for:', id);
      handleUpdate();
    } else if (!isInstalled) {
      console.log('Handling install for:', id);
      handleInstall();
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} thickness={5} />
          <span>{installing ? 'Installing' : 'Updating'}... {progress}%</span>
        </Box>
      );
    }

    if (!isInstalled) {
      return 'Install';
    }

    if (updateAvailable && !isVSCode && !isNode) {
      return 'Update Available';
    }

    return versions.current ? 'Up to date' : 'Installed';
  };

  return (
    <Card
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only trigger card click if not clicking menu or buttons
        if (e.target.closest('button') === null && onCardClick) {
          onCardClick();
        }
      }}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: showUpdateAnimation ? 'scale(1.02)' : 'none',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        }
      }}
    >
      {isLoading && (
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        />
      )}

      <Box 
        sx={{ 
          position: 'absolute', 
          top: isLoading ? 12 : 8,
          right: 8,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Zoom in={showSuccessNotification} mountOnEnter unmountOnExit>
          <Chip
            icon={<CheckCircleIcon />}
            label={installing ? "Installation Complete" : "Update Complete"}
            color="success"
            size="small"
            sx={{ 
              fontWeight: 'medium',
              animation: 'fadeOut 3s forwards',
              '@keyframes fadeOut': {
                '0%': { opacity: 1 },
                '70%': { opacity: 1 },
                '100%': { opacity: 0 },
              },
            }}
          />
        </Zoom>
        {!isVSCode && !isNode && (
          <Fade in={updateAvailable && !isLoading}>
            <Chip
              icon={<ArrowUpwardIcon />}
              label={`Update to v${getMainVersion(versions.latest) || 'latest'}`}
              color="primary"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUpdate(e);
              }}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                borderRadius: 1,
                fontWeight: 'medium',
                animation: 'bounce 1s infinite',
                '@keyframes bounce': {
                  '0%, 100%': {
                    transform: 'translateY(0)',
                  },
                  '50%': {
                    transform: 'translateY(-2px)',
                  },
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            />
          </Fade>
        )}
        {isInstalled && !isVSCode && !isNode && (
          <IconButton 
            size="small"
            onClick={handleMenuClick}
            disabled={isLoading}
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 1,
              transition: 'all 0.2s ease',
              ...(checkingUpdate && {
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }),
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'scale(1.1)',
              }
            }}
          >
            {checkingUpdate ? (
              <CircularProgress size={20} thickness={5} />
            ) : (
              <MoreVertIcon />
            )}
          </IconButton>
        )}
        {isInstalled && isVSCode && (
          <Tooltip title="Updates are handled through Visual Studio Code">
            <InfoIcon color="action" sx={{ opacity: 0.5 }} />
          </Tooltip>
        )}
        {isInstalled && isNode && (
          <Tooltip title="Node.js updates are handled through the package manager">
            <TerminalIcon color="action" sx={{ opacity: 0.5 }} />
          </Tooltip>
        )}
        {isInstalled && id === 'postman' && (
          <Tooltip title="Updates are handled through Postman's auto-update system">
            <InfoIcon color="action" sx={{ opacity: 0.5 }} />
          </Tooltip>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              py: 1.5,
            }
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={200}
      >
        <MenuItem 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCheckUpdate(e);
          }}
          disabled={checkingUpdate || isLoading}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            width: '100%',
          }}>
            {checkingUpdate ? (
              <>
                <CircularProgress size={20} thickness={5} />
                <Typography>Checking for Updates...</Typography>
              </>
            ) : (
              <>
                <RefreshIcon fontSize="small" />
                <Typography>Check for Updates</Typography>
              </>
            )}
          </Box>
        </MenuItem>
        {updateAvailable && !isLoading && (
          <MenuItem onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUpdate(e);
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              color: 'primary.main',
            }}>
              <UpdateIcon fontSize="small" />
              <Typography sx={{ fontWeight: 'medium' }}>
                Update to v{getMainVersion(versions.latest) || 'latest'}
              </Typography>
            </Box>
          </MenuItem>
        )}
      </Menu>

      <CardContent 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        sx={{ pt: 5, pb: 2, flex: 1 }}
      >
        <Box 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
        >
          <Box
            component="img"
            src={icon}
            alt={name}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            sx={{
              width: 48,
              height: 48,
              mr: 2,
              borderRadius: 1,
              objectFit: 'contain',
              filter: updateAvailable ? 'none' : 'grayscale(0.2)',
              transition: 'all 0.3s ease',
              transform: showUpdateAnimation ? 'scale(1.1)' : 'none',
            }}
          />
          <Box 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            sx={{ flex: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography 
                variant="h6" 
                component="h2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {name}
              </Typography>
              {isInstalled && (
                <Chip
                  size="small"
                  label={versions.current ? (isNode ? getMainVersion(versions.current) : `v${getMainVersion(versions.current)}`) : 'Version Unknown'}
                  color={updateAvailable ? "warning" : versions.current ? "primary" : "default"}
                  variant={updateAvailable ? "filled" : "outlined"}
                  sx={{ 
                    height: '22px',
                    ml: 1,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      fontStyle: versions.current ? 'normal' : 'italic'
                    },
                    ...(updateAvailable && {
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': {
                          transform: 'scale(1)',
                        },
                        '50%': {
                          transform: 'scale(1.05)',
                        },
                        '100%': {
                          transform: 'scale(1)',
                        },
                      },
                    }),
                  }}
                />
              )}
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              display="block"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {developer}
            </Typography>
          </Box>
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {description}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant={isInstalled ? "outlined" : "contained"}
          fullWidth
          data-testid={`install-button-${id}`}
          startIcon={isLoading ? undefined : updateAvailable && !isVSCode && !isNode ? <UpdateIcon /> : isInstalled ? <CheckIcon /> : <DownloadIcon />}
          onClick={handleButtonClick}
          disabled={isLoading || (isInstalled && (isVSCode || isNode || id === 'postman'))}
          color={updateAvailable && !isVSCode && !isNode ? "primary" : isInstalled ? "success" : "primary"}
          sx={{
            transition: 'all 0.3s ease',
            ...(updateAvailable && !isVSCode && !isNode && {
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)',
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)',
                },
              },
            }),
          }}
        >
          {getButtonText()}
        </Button>
      </Box>

      <Snackbar 
        open={Boolean(error)} 
        autoHideDuration={6000} 
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleErrorClose} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AppCard;
