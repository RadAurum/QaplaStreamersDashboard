import React, { useState, useEffect } from 'react';
import { makeStyles, Button, Checkbox } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import styles from './OnBoarding.module.css';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import { useHistory } from 'react-router-dom';
import { getEmotes, getUserWebhooks, subscribeStreamerToTwitchWebhook } from '../../services/functions';
import { createInteractionsReward } from '../../services/interactionsQapla';
import { loadTwitchExtensionReactionsPrices, saveInteractionsRewardData, writeTestCheer } from '../../services/database';
import { CHEERS_URI, InteractionsRewardRedemption, ZAP_REWARD_NAME } from '../../utilities/Constants';
import { notifyBugToDevelopTeam } from '../../services/discord';
import ReactionCard from '../ReactionCard/ReactionCard';

import { ReactComponent as Unchecked } from './../../assets/Unchecked.svg';
import { ReactComponent as Checked } from './../../assets/Checked.svg';
import { ReactComponent as GIFIcon } from './../../assets/reactionCardsIcons/GIF.svg';
import { ReactComponent as MemesIcon } from './../../assets/reactionCardsIcons/Memes.svg';
import { ReactComponent as MegaStickerIcon } from './../../assets/reactionCardsIcons/MegaSticker.svg';
import { ReactComponent as AvatarIcon } from './../../assets/reactionCardsIcons/Avatar.svg';
import { ReactComponent as TtGiphyIcon } from './../../assets/reactionCardsIcons/TtGiphy.svg';
import { ReactComponent as TTSBotIcon } from './../../assets/reactionCardsIcons/TTSBot.svg';
import { ReactComponent as PlusIcon } from './../../assets/reactionCardsIcons/+.svg';
import { ReactComponent as ArrowRight } from './../../assets/arrowRight.svg';
import { ReactComponent as Zap } from './../../assets/Zap.svg';
import ChannelPointsImage from './../../assets/channel-pts-twitch-icon@4x.png';
import { deleteCustomReward, getUserCustomRewards } from '../../services/twitch';

const useStyles = makeStyles((theme) => ({
    button: {
        backgroundColor: '#00FFDD',
        color: '#141833',
        width: '390px',
        height: '60px',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '0.492000013589859px',
        textTransform: 'none',
        borderRadius: '16px',
        '&:hover': {
            backgroundColor: '#00EACB',
            opacity: .9
        },
        '&:disabled': {
            backgroundColor: '#00EACB !important',
            opacity: .75
        },
    },
    copyOverlayLinkButton: {
        backgroundColor: '#202750',
        display: 'flex',
        marginTop: '32px',
        borderRadius: '8px',
        width: '346px',
        height: '45px',
        alignItems: 'center',
        padding: '0',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#202750'
        },
    },
    testButton: {
        backgroundColor: '#3B4BF9',
        color: '#fff',
        width: '346px',
        height: '60px',
        fontsize: '16px',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '0.492000013589859px',
        textTransform: 'none',
        borderRadius: '16px',
        '&:hover': {
            backgroundColor: '#2E3BC9'
        },
    },
}));

const OnBoarding = ({ user }) => {
    const classes = useStyles();
    const history = useHistory();
    const [step, setStep] = useState(0);
    const [errorCode, setErrorCode] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [overlayLinkCopied, setOverlayLinkCopied] = useState(false);
    const [streamerOverlayLink, setStreamerOverlayLink] = useState(CHEERS_URI);
    const [stepIndicator, setStepIndicator] = useState(0);
    const [acceptPolicies, setAcceptPolicies] = useState(true);
    const [randomEmoteUrl, setRandomEmoteUrl] = useState('');
    const [reactionsPrices, setReactionsPrices] = useState([]);
    const [creatingReward, setCreatingReward] = useState(false);
    const [loadingDots, setLoadingDots] = useState('.');
    const [zapPrice, setZapPrice] = useState(200);
    const [segmentCallMade, setSegmentCallMade] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (user && user.id) {
            setStreamerOverlayLink(`${CHEERS_URI}/${user.id}`);
        }

        async function getRandomEmote() {
            if (user && user.uid) {
                const emotesRequest = await getEmotes(user.uid);

                const emotes = emotesRequest.data ? emotesRequest.data : null;
                if (emotes) {
                    // Find the first array who has more than 0 elements
                    const array = emotes.find((typeOfEmote) => typeOfEmote.data[0].length > 0);
                    const randomNumber = Math.floor(Math.random() * array.data[0].length);

                    setRandomEmoteUrl(array.data[0][randomNumber].images.url_1x);
                }
            }
        }

        async function loadTwitchExtensionPrices() {
            const prices = await loadTwitchExtensionReactionsPrices();
            if (prices.exists()) {
                setReactionsPrices(prices.val());
            }
        }

        loadTwitchExtensionPrices();

        if (!randomEmoteUrl) {
            getRandomEmote();
        }
    }, [user]);

    useEffect(() => {
        if (user && user.id && !segmentCallMade) {
            window.analytics.track('User Opened Onboarding', {
                StreamerId: user.id,
                StreamerUid: user.uid,
                StreamerName: user.displayName
            });

            setSegmentCallMade(true);
        }
    }, [user, segmentCallMade]);

    useEffect(() => {
        if (creatingReward) {
            setTimeout(() => {
                setLoadingDots(loadingDots.length < 3 ? loadingDots + '.' : '.');
            }, 750);
        }
    }, [creatingReward, loadingDots]);

    const handleMainButton = async () => {
        switch (step) {
            case -1:
                if (errorCode === 403) {
                    openTwitchAffiliateProgram();
                } else {
                    openDiscordSupport();
                }
                break;
            case 0:
                setStep(step + 1);
                break;
            case 1:
                createChannelPointsRewards();
                break;
            case 3:
                setStepIndicator(1);
                setStep(step + 1);
                break;
            case 4:
                setStepIndicator(2);
                setStep(step + 1);
                break;
            case 5:
                setStep(step + 1);
                break;
            case 6:
                await window.analytics.track('User Finished Onboarding', {
                    StreamerId: user.id,
                    StreamerUid: user.uid,
                    StreamerName: user.displayName
                }, () => history.push('/profile'));
                break;
            default:
                break;
        }
    }

    const openDiscordSupport = () => {
        window.open('https://discord.gg/2UMQ6ZXPkq', '_blank');
    }

    const openTwitchAffiliateProgram = () => {
        window.open('https://help.twitch.tv/s/article/joining-the-affiliate-program', '_blank');
    }

    const createChannelPointsRewards = async (attempt = 1) => {
        setStep(step + 1);
        setCreatingReward(true);
        // Create reward with default value, the user can change their cost in the next step
        const result = await createInteractionsReward(user.uid, user.id, user.refreshToken, ZAP_REWARD_NAME, zapPrice);

        if (result !== undefined) {
            if (result.reward.status === 200) {
                const webhookSubscription = await subscribeStreamerToTwitchWebhook(user.id, InteractionsRewardRedemption.type, InteractionsRewardRedemption.callback, { reward_id: result.reward.data.id });

                if (webhookSubscription.data.id) {
                    // Store on database
                    await saveInteractionsRewardData(user.uid, result.reward.data.id, webhookSubscription.data.id);

                    setCreatingReward(false);
                    return setStep(3);
                } else {
                    if (attempt === 1) {
                        // Webhook creation failed, delete reward and try again
                        await deleteCustomReward(user.id, user.twitchAccessToken, result.reward.data.id);

                        setCreatingReward(false);
                        return createChannelPointsRewards(2);
                    } else {
                        // If we fail 2 times to create the webhook notify developer team
                        notifyBugToDevelopTeam(`${user.uid} Reward webhook creation error`);

                        setCreatingReward(false);
                        return onErrorChannelPointsCreation(500);
                    }
                }
            } else {
                // Duplicated reward or channel points rewards are full
                if (result.reward.status === 400) {
                    const userWebhooks = await getUserWebhooks(user.id);

                    const webhookExists = userWebhooks.data.some((webhook) => {
                        if (webhook.type === 'channel.channel_points_custom_reward_redemption.add') {
                            return true;
                        }

                        return false;
                    });

                    // Reward exists but does not have webhook linked
                    if (!webhookExists) {
                        if (attempt === 1) {
                            const userRewards = await getUserCustomRewards(user.id, user.twitchAccessToken);

                            if (userRewards) {
                                return userRewards.forEach(async (reward) => {
                                    // Find Qapla Reward
                                    if (reward.title === ZAP_REWARD_NAME) {
                                        // Reward already exists, but webhook does not, delete reward and try again
                                        await deleteCustomReward(user.id, user.twitchAccessToken, reward.id);

                                        setCreatingReward(false);
                                        return createChannelPointsRewards(2);
                                    }
                                });
                            }
                        } else {
                            // If we fail 2 times to create the reward and webhook notify developer team
                            notifyBugToDevelopTeam(`${user.uid} Reactions reward creation error: ` + JSON.stringify(result.reward));

                            setCreatingReward(false);
                            return onErrorChannelPointsCreation(result.reward.status, result.reward.message);
                        }
                    } else {
                        // Webhook and reward already exists
                        setCreatingReward(false);
                        return setStep(3);
                    }
                } else if (result.reward.status === 403) {
                    setCreatingReward(false);
                    onErrorChannelPointsCreation(result.reward.status, result.reward.error);
                }
            }
        } else {
            notifyBugToDevelopTeam(`${user.uid} Reactions reward creation error: error 0 (auth token expired)`);

            setCreatingReward(false);
            return onErrorChannelPointsCreation(0);
        }
    }

    const onErrorChannelPointsCreation = (errorCode, errorMessage) => {
        setErrorCode(errorCode);
        if (errorCode === 403) {
            setErrorMessage('noAffiliate');
        } else {
            let errorTranslationKey = errorMessage === 'CREATE_CUSTOM_REWARD_TOO_MANY_REWARDS' ? 'tooManyRewards' : 'duplicatedReward';
            setErrorMessage(errorTranslationKey);
        }
        setStep(-1);
    }

    const handleCopyOverlayLink = () => {
        copyCheersURL();
        setOverlayLinkCopied(true);
    }

    const handleTestOverlay = () => {
        writeTestCheer(user.uid);
    }

    const copyCheersURL = () => {
        navigator.clipboard.writeText(streamerOverlayLink);
    }

    const handlePoliciesCheckbox = () => setAcceptPolicies(!acceptPolicies);

    return (
        <div style={{
            background: 'conic-gradient(from 134.88deg at 50.55% 49.24%, #5600E1 -61.47deg, #373FFF 26.68deg, #A534FE 167.74deg, #B518FF 197.3deg, #5600E1 298.53deg, #373FFF 386.68deg), rgba(3, 7, 34, 0.95)',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        }}>
            {step !== 4 &&
                <div style={{
                    marginTop: 24,
                    position: 'relative',
                    display: 'flex',
                    backgroundColor: '#141833',
                    width: '450px',
                    height: step === 5 ? '402px' : '256px',
                    borderRadius: '35px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    zIndex: 500,
                }}>
                    {step === -1 &&
                        <>
                            <img src={`https://media.giphy.com/media/51Uiuy5QBZNkoF3b2Z/giphy.gif`} alt={`Scared Dog`}
                                style={{
                                    position: 'absolute',
                                    bottom: 190, // 256 - 23 (height of container - hidden part of the image)
                                    width: '238px',
                                    height: '239px',
                                    zIndex: '1000',
                                }}
                            />
                        </>
                    }
                    {step === 0 &&
                        <>
                            <img src={`https://media.giphy.com/media/yQssIXdTQlbN3EEPYj/giphy.gif`} alt={`Barnaby on PC`}
                                style={{
                                    zIndex: -1,
                                    position: 'absolute',
                                    bottom: 256, // 256 - 23 (height of container - hidden part of the image)
                                    width: '334px',
                                    height: '179px',
                                    resize: ''
                                }}
                            />
                        </>
                    }
                    {step === 1 &&
                        <>
                            <img src='https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2FZaps%2520(3).gif?alt=media&token=8501e6c2-a17b-4b7e-aa6c-2ba8a1ed5acd'
                                alt='Zaps'
                                style={{
                                    position: 'absolute',
                                    bottom: 256, // height of container
                                    width: '300px',
                                    height: '150px',
                                }}
                            />
                            <img src={`https://media.giphy.com/media/3oFzlW8dht4DdvwBqg/giphy.gif`} alt={`Barnaby Looking`}
                                style={{
                                    position: 'absolute',
                                    bottom: 244, // 256 - 12 (height of container - hidden part of the image)
                                    width: '162px',
                                    height: '151px',
                                    zIndex: '1000',
                                    transform: 'rotate(-3.45deg)',
                                }}
                            />
                        </>
                    }
                    {step === 2 &&
                        <>
                            <img src='https://media.giphy.com/media/3o752nnUPE7OzLeSVW/giphy.gif' alt={`Barnaby Working`}
                                style={{
                                    position: 'absolute',
                                    bottom: 256, // 256 - 8 (height of container - hidden part of the image)
                                    width: '206px',
                                    height: '135px',
                                    zIndex: '1',
                                }}
                            />
                        </>
                    }
                    {step === 3 &&
                        <>
                            <img src='https://media.giphy.com/media/xULW8v7LtZrgcaGvC0/giphy.gif' alt={`Barnaby Says Thanks`}
                                style={{
                                    position: 'absolute',
                                    bottom: 190, // 256 - 66 (height of container - visible part of the image over the card)
                                    width: '239px',
                                    height: '239px',
                                    zIndex: '1000',
                                }}
                            />
                        </>
                    }
                    {step === 5 &&
                        <>
                            <img src='https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2Foverlay.gif?alt=media&token=178044eb-f697-44ad-860c-81e93741d276'
                                alt='overlay'
                                style={{
                                    position: 'absolute',
                                    bottom: 402, // 402 - 66 (height of container)
                                    width: '300px',
                                    height: '150px',
                                }}
                            />
                            <img src={`https://media.giphy.com/media/3oFzlW8dht4DdvwBqg/giphy.gif`} alt={`Barnaby Looking`}
                                style={{
                                    position: 'absolute',
                                    bottom: 390, // 256 - 12 (height of container - hidden part of the image)
                                    width: '162px',
                                    height: '151px',
                                    zIndex: '1000',
                                    transform: 'rotate(-3.45deg)',
                                }}
                            />
                        </>
                    }
                    {step === -1 &&
                        <>
                            <p style={{ marginTop: '42px' }} className={styles.headerText}>
                                {t(`Onboarding.${errorMessage}.title`)}
                            </p>
                            <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                                {t(`Onboarding.${errorMessage}.description`)}
                            </p>
                        </>
                    }
                    {step === 0 &&
                        <>
                            <p className={styles.headerText}>
                                {t('Onboarding.letsSetUp')}
                            </p>
                            <ul>
                                <li className={styles.subText}>
                                    {t('Onboarding.processDescriptionP1')}
                                </li>
                                <li className={`${styles.subText} ${styles.liMargin}`}>
                                    {t('Onboarding.processDescriptionP2')}
                                </li>
                                <li className={`${styles.subText} ${styles.liMargin}`}>
                                    {t('Onboarding.processDescriptionP3')}
                                </li>
                            </ul>
                        </>
                    }
                    {step === 1 &&
                        <>
                            <h1 className={styles.headerText}>
                                {t('Onboarding.setZapPrice')}
                            </h1>
                            <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                                {t('Onboarding.zapBenefits')}
                            </p>
                            <div className={styles.zapPriceContainer}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <div style={{
                                        height: '32px',
                                        width: '32px',
                                        borderRadius: '5px',
                                        background: '#8B46FF',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: '8px'
                                    }}>
                                        <img src={ChannelPointsImage} style={{
                                            width: '20px',
                                            height: '30px',
                                            objectFit: 'contain'
                                        }} />
                                    </div>
                                    <div className={styles.qoinsMainContainer}>
                                        <div className={styles.qoinsSubContainer}>
                                        <input
                                            className={styles.qoins}
                                            value={zapPrice}
                                            onChange={(e) => setZapPrice(parseInt(e.target.value) >= 1 ? parseInt(e.target.value) : 1)}
                                            min={1}
                                            type='number'
                                            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()} />
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight />
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <Zap />
                                    <p style={{ marginLeft: '4px', fontSize: '18px', fontWeight: '700', color: '#FFF' }}>
                                        1 Zap
                                    </p>
                                </div>
                            </div>
                        </>
                    }
                    {step === 2 &&
                        <>
                            <h1 className={styles.gradientText}>
                                {t('Onboarding.workingOnRequest', { loadingDots })}
                            </h1>
                        </>
                    }
                    {step === 3 &&
                        <>
                            <h1 className={styles.gradientText}>
                                {t('Onboarding.rewardCreated')}
                            </h1>
                        </>
                    }
                    {step === 5 &&
                        <>
                            <h1 className={styles.headerText}>
                                {t('Onboarding.addReactionsToOverlay')}
                            </h1>
                            <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                                {t('Onboarding.copyLink')}
                            </p>
                            <div style={{
                                marginTop: '32px',
                                display: 'flex',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}>
                                    <p className={styles.overlayResText}>
                                        {t('Onboarding.width')}
                                    </p>
                                    <div className={styles.overlayResNumbContainer}>
                                        <p className={styles.overlayResNumb}>
                                            1920
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    marginLeft: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                }}>
                                    <p className={styles.overlayResText}>
                                        {t('Onboarding.height')}
                                    </p>
                                    <div className={styles.overlayResNumbContainer}>
                                        <p className={styles.overlayResNumb}>
                                            1080
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                disableRipple
                                onClick={handleCopyOverlayLink}
                                className={classes.copyOverlayLinkButton}>
                                <p style={{
                                    color: '#6C5DD3',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    lineHeight: '24px',
                                    textAlign: 'center',
                                    flexGrow: 1,
                                }}>
                                    {streamerOverlayLink}
                                </p>
                                <CopyIcon style={{
                                    justifySelf: 'flex-end',
                                }} />
                            </Button>
                            <div style={{
                                marginTop: '32px',
                            }}>
                                {overlayLinkCopied ?
                                    <Button
                                        onClick={handleTestOverlay}
                                        className={classes.testButton}>
                                        {t('Onboarding.testOverlay')}
                                    </Button>
                                    :
                                    <div style={{ height: '60px' }} />
                                }
                            </div>
                        </>
                    }
                    {step === 6 &&
                        <>
                            <img src={`https://media.giphy.com/media/3o751SMzZ5TjLWInoQ/giphy.gif`} alt={`Barnaby Thats Rad`}
                                style={{
                                    position: 'absolute',
                                    bottom: 135, // 256 - 121
                                    width: '351px',
                                    height: '220px',
                                    marginTop: '-100px',
                                }}
                            />
                            <img src='https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2Fyou%2520are%2520set.gif?alt=media&token=0c285185-9be1-4f56-ae8e-efd67a7e2099'
                                alt={`you're set`}
                                style={{
                                    position: 'absolute',
                                    bottom: 24, // 256 - 121
                                    width: '400px',
                                    height: '107px',
                                }}
                            />
                        </>
                    }
                </div>
            }
            {step === 4 &&
                <>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        transform: 'translateY(260px)',
                    }}>
                        <img src='https://firebasestorage.googleapis.com/v0/b/qapplaapp.appspot.com/o/OnboardingGifs%2FReactionTiers.gif?alt=media&token=6a2e66ba-5749-4a0e-a0f1-e6411d1ee9f3'
                            alt='channel points'
                            style={{
                                position: 'absolute',
                                width: '269px',
                                height: '134px',
                                transform: 'rotate(-15deg)',
                                bottom: 256, // 256 (height of container)
                            }}
                        />
                        <img src={`https://media.giphy.com/media/3oFzlW8dht4DdvwBqg/giphy.gif`} alt={`Barnaby Looking`}
                            style={{
                                position: 'absolute',
                                width: '162px',
                                height: '151px',
                                zIndex: '1000',
                                transform: 'rotate(-3.45deg)',
                                bottom: 244, // 256 - 12 (height of container - hidden part of the image)
                            }}
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '24px',
                        flexWrap: 'wrap',
                    }}>
                        <ReactionCard
                            icons={
                                [
                                    <GIFIcon />,
                                    <MemesIcon />,
                                    <MegaStickerIcon />,
                                ]
                            }
                            title={t('StreamerProfile.ReactionCard.tier1Title')}
                            subtitle={t('StreamerProfile.ReactionCard.tier1Subtitle')}
                            textMaxWidth='110px'
                            reactionLevel={1}
                            user={user}
                            availablePrices={reactionsPrices}
                            hideBorder
                            subsMode={1}
                        />
                        <ReactionCard
                            icons={
                                [
                                    <PlusIcon fill={'url(#icons-gradient)'} />,
                                    <AvatarIcon fill={'url(#icons-gradient)'} />,
                                    <TtGiphyIcon fill={'url(#icons-gradient)'} />,
                                    <TTSBotIcon fill={'url(#icons-gradient)'} />,
                                ]
                            }
                            title={t('StreamerProfile.ReactionCard.tier2Title')}
                            subtitle={t('StreamerProfile.ReactionCard.tier2Subtitle')}
                            textMaxWidth='160px'
                            reactionLevel={2}
                            user={user}
                            availablePrices={reactionsPrices}
                            hideBorder
                            subsMode={1}
                        />
                        <ReactionCard
                            icons={
                                [
                                    <PlusIcon fill={'url(#icons-gradient)'} />,
                                    <img src={randomEmoteUrl}
                                        style={{ height: 24, width: 24 }} />
                                ]
                            }
                            title={t('StreamerProfile.ReactionCard.tier3Title')}
                            subtitle={t('StreamerProfile.ReactionCard.tier3Subtitle')}
                            textMaxWidth='130px'
                            reactionLevel={3}
                            user={user}
                            availablePrices={reactionsPrices}
                            hideBorder
                            subsMode={1}
                        />
                    </div>
                    <p className={styles.headerText} style={{ marginTop: '40px', marginBottom: '16px' }}>
                        {t('Onboarding.tiersPricingInstructions')}
                    </p>
                </>
            }
            <div
                style={{
                    marginTop: 24,
                }}>
                <Button
                    disabled={step === 2 || (step === 5 && !overlayLinkCopied) || (step === 0 && !acceptPolicies) || creatingReward}
                    onClick={handleMainButton}
                    className={classes.button}
                >
                    {step === -1 &&
                        <>
                            {errorCode === 403 ?
                                t('Onboarding.goToTwitch')
                                :
                                t('Onboarding.goToDiscord')
                            }
                        </>
                    }
                    {step === 0 &&
                        <>
                            {t('Onboarding.letsGo')}
                        </>
                    }
                    {step === 1 &&
                        <>
                            {t('Onboarding.createZap')}
                        </>
                    }
                    {step === 2 &&
                        <>
                            {t('Onboarding.waitABit')}
                        </>
                    }
                    {step === 3 &&
                        <>
                            {t('Onboarding.configureTiers')}
                        </>
                    }
                    {step === 4 &&
                        <>
                            {t('Onboarding.imAllSet')}
                        </>
                    }
                    {step === 5 &&
                        <>
                            {overlayLinkCopied ?
                                t('Onboarding.finishSetUp')
                                :
                                t('Onboarding.copyToTest')
                            }
                        </>
                    }
                    {step === 6 &&
                        <>
                            {t('Onboarding.goToDashboard')}
                        </>
                    }
                </Button>
            </div>
            {step !== 6 &&
                <div style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: 72,
                }}>
                    <div style={{
                        backgroundColor: stepIndicator === 0 ? '#00FEDF' : '#00FEDF8A',
                        height: '8px',
                        width: stepIndicator === 0 ? '28px' : '8px',
                        borderRadius: '4px',
                        margin: '0px 6.5px',
                    }} />
                    <div style={{
                        backgroundColor: stepIndicator === 1 ? '#00FEDF' : '#00FEDF8A',
                        height: '8px',
                        width: stepIndicator === 1 ? '28px' : '8px',
                        borderRadius: '4px',
                        margin: '0px 6.5px',

                    }} />
                    <div style={{
                        backgroundColor: stepIndicator === 2 ? '#00FEDF' : '#00FEDF8A',
                        height: '8px',
                        width: stepIndicator === 2 ? '28px' : '8px',
                        borderRadius: '4px',
                        margin: '0px 6.5px',
                    }} />
                </div>
            }
            {step === 0 &&
                <div style={{ position: 'absolute', bottom: 24, display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                        icon={<Unchecked />}
                        checkedIcon={<Checked />}
                        onChange={handlePoliciesCheckbox}
                        checked={acceptPolicies}
                        style={{ paddingRight: '0px' }}
                    />
                    <div style={{ opacity: acceptPolicies ? 1 : 0.7, color: '#FFF', paddingLeft: '6px' }}>
                        {t('Onboarding.policiesP1')}
                        <a href={t('Onboarding.termsOfUseUrl')} target='_blank'
                            rel='noreferrer'
                            style={{ color: '#00FFDD', marginLeft: 4, marginRight: 4, textDecoration: 'none' }}>
                            {t('Onboarding.policiesP2')}
                        </a>
                        {t('Onboarding.policiesP3')}
                        <a href={t('Onboarding.privacyPolicy')}
                            target='_blank'
                            rel='noreferrer'
                            style={{ color: '#00FFDD', marginLeft: 4, textDecoration: 'none' }}>
                            {t('Onboarding.policiesP4')}
                        </a>
                    </div>
                </div>
            }
        </div>
    )

}

export default OnBoarding;