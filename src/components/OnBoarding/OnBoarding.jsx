import React, { useState } from "react";
import { makeStyles, Button } from "@material-ui/core";
import styles from './OnBoarding.module.css';

import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import { useHistory } from "react-router-dom";

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
            backgroundColor: '#00EACB'
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

const OnBoarding = ({ user, games }) => {
    const classes = useStyles();
    const history = useHistory();
    const [step, setStep] = useState(0);
    const [channelPointsRewardCost, setChannelPointsRewardCost] = useState(2000);
    const [errorCode, setErrorCode] = useState(0);
    const [overlayLinkCopied, setOverlayLinkCopied] = useState(false);
    const [streamerOverlayLink, setStreamerOverlayLink] = useState('https://www.twitch.tv/');
    const [stepIndicator, setStepIndicator] = useState(0);

    const handleMainButton = () => {
        if (step === -1) {
            return openDiscordSupport();
        }
        if (step === 0) {
            setStepIndicator(1);
        }
        if (step === 1) {
            return createChannelPointsRewards();
        }
        if (step === 3) {
            setStepIndicator(2);
        }
        if (step === 5) {
            return history.push('/profile');
        }
        setStep(step + 1);
    }

    const openDiscordSupport = () => {
        console.log('discord');
    }

    const createChannelPointsRewards = () => {
        console.log('creating channel points rewards');
        setStep(step + 1);
        setTimeout(() => {
            onSuccessfullChannelPointsCreation();
            // onErrorChannelPointsCreation('402');
        }, 1000);
    }

    const onSuccessfullChannelPointsCreation = () => {
        console.log('created');
        setStep(step + 2);
    }

    const onErrorChannelPointsCreation = (eC) => {
        setErrorCode(eC);
        setStep(-1);
    }

    const handleChannePointsRewardCostChange = (e) => {
        setChannelPointsRewardCost(e.target.value);
    }

    const handleCopyOverlayLink = () => {
        console.log('copy');
        setOverlayLinkCopied(true);
    }

    const handleTestOverlay = () => {
        console.log('test overlay');
    }

    return (
        <div style={{
            background: 'conic-gradient(from 134.88deg at 50.55% 49.24%, #5600E1 -61.47deg, #373FFF 26.68deg, #A534FE 167.74deg, #B518FF 197.3deg, #5600E1 298.53deg, #373FFF 386.68deg), rgba(3, 7, 34, 0.95)',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        }}>
            {step === -1 &&
                <>
                    <img src={`https://media.giphy.com/media/51Uiuy5QBZNkoF3b2Z/giphy.gif`} alt={`Scared Dog`}
                        style={{
                            position: 'absolute',
                            width: '238px',
                            height: '239px',
                            marginTop: '-230px',
                            zIndex: '1000',
                        }}
                    />
                </>}
            {step === 0 &&
                <>
                    <img src={`https://media.giphy.com/media/xT8pdY1jyzYYU6Gpaw/giphy.gif`} alt={`Barnaby on PC`}
                        style={{
                            position: 'absolute',
                            width: '334px',
                            height: '202px',
                            marginTop: '-250px',
                        }}
                    />
                </>}
            {step === 1 &&
                <>
                    <img src='https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c842463b-291d-4172-910c-e5f40a673ea7/channelpoints-pink.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220830%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220830T171548Z&X-Amz-Expires=86400&X-Amz-Signature=a3a1c0e04ecde2d13557c07daabc6cea08e962753f2eae9080b3586e27c9402b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22channelpoints-pink.gif%22&x-id=GetObject'
                        alt='channel points'
                        style={{
                            position: 'absolute',
                            width: '269px',
                            height: '134px',
                            marginTop: '-230px',
                            transform: 'rotate(-15deg)',
                        }}
                    />
                    <img src={`https://media.giphy.com/media/3oFzlW8dht4DdvwBqg/giphy.gif`} alt={`Barnaby Looking`}
                        style={{
                            position: 'absolute',
                            width: '162px',
                            height: '151px',
                            marginTop: '-233px',
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
                            width: '206px',
                            height: '135px',
                            marginTop: '-220px',
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
                            width: '239px',
                            height: '239px',
                            marginTop: '-220px',
                            zIndex: '1000',
                        }}
                    />
                </>
            }
            {step === 4 &&
                <>
                    <img src='https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f3d31749-cd27-4908-b913-9c5d227cc342/overlay.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220830%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220830T173737Z&X-Amz-Expires=86400&X-Amz-Signature=48fefc679c88f8deb2875bff1d595158917f87f8f051661c629ef077d465af68&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22overlay.gif%22&x-id=GetObject'
                        alt='overlay'
                        style={{
                            position: 'absolute',
                            width: '300px',
                            height: '150px',
                            marginTop: '-300px',
                        }}
                    />
                    <img src={`https://media.giphy.com/media/3oFzlW8dht4DdvwBqg/giphy.gif`} alt={`Barnaby Looking`}
                        style={{
                            position: 'absolute',
                            width: '162px',
                            height: '151px',
                            marginTop: '-306px',
                            zIndex: '1000',
                            transform: 'rotate(-3.45deg)',
                        }}
                    />
                </>
            }
            <div style={{
                display: 'flex',
                backgroundColor: '#141833',
                width: '450px',
                height: step === 4 ? '402px' : '256px',
                borderRadius: '35px',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                zIndex: '500',
            }}>
                {step === -1 && <>
                    <p style={{ marginTop: '20px' }} className={styles.headerText}>
                        {`Oh no! Error ${errorCode}`}
                    </p>
                    <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                        {`Don’t worry. Let’s try again! Make sure your channel rewards are not full `}
                    </p>
                </>}
                {step === 0 && <>
                    <p className={styles.headerText}>
                        {`Let’s set up your account`}
                    </p>
                    <ul>
                        <li className={styles.subText}>
                            {`🔗 We’ll create a Custom Reward on your channel with one click`}
                        </li>
                        <li className={`${styles.subText} ${styles.liMargin}`}>
                            {`🪪 We‘ll add a browser source to your OBS/Streamlabs`}
                        </li>
                    </ul>
                </>}
                {step === 1 && <>
                    <p className={styles.headerText}>
                        {`Set the custom reward “cost”`}
                    </p>
                    <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                        {`This is how much channel points your viewers will burn per reaction. You can always change it later`}
                    </p>
                    <div className={styles.qoinsMainContainer}>
                        <div className={styles.qoinsSubContainer}>
                            <input
                                className={styles.qoins}
                                type="number"
                                value={channelPointsRewardCost}
                                onChange={handleChannePointsRewardCostChange}

                            />
                        </div>
                    </div>
                </>}
                {step === 2 && <>
                    <h1 className={styles.gradientText}>
                        {`I’m working on your request lovely human`}
                    </h1>
                </>}
                {step === 3 && <>
                    <h1 className={styles.gradientText}>
                        {`Custom reward created successfully!`}
                    </h1>
                </>}
                {step === 4 && <>
                    <h1 className={styles.headerText}>
                        {`Add the reactions overlay`}
                    </h1>
                    <p className={`${styles.subText} ${styles.subTextMartinTop} ${styles.alignTextCenter}`}>
                        {`Copy the link and add it as a browser source on your OBS/Streamlabs`}
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
                                {`Width`}
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
                                {`Height`}
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
                            {`${streamerOverlayLink}`}
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
                                {`TestOverlay`}
                            </Button>
                            :
                            <div style={{ height: '60px' }} />
                        }
                    </div>


                </>}
                {step === 5 && <>
                    <img src={`https://media.giphy.com/media/3o751SMzZ5TjLWInoQ/giphy.gif`} alt={`Barnaby Thats Rad`}
                        style={{
                            width: '351px',
                            height: '220px',
                            marginTop: '-100px',
                        }}
                    />
                    <img src='https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f43e82ea-dfdd-4542-8d32-4dcba84e573d/you_are_set.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220830%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220830T174423Z&X-Amz-Expires=86400&X-Amz-Signature=28eb462c0fc2b4e03083bf5ea609ed384c312ee41907e1d7b4e324ce99c35541&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22you%2520are%2520set.gif%22&x-id=GetObject'
                        alt={`you're set`}
                        style={{
                            width: '400px',
                            height: '107px',
                            marginTop: '8px',
                        }}
                    />
                </>}
            </div>
            <div
                style={{
                    marginTop: '24px',
                }}>
                <Button
                    disabled={step === 2 || (step === 4 && !overlayLinkCopied)}
                    onClick={handleMainButton}
                    className={classes.button}
                >
                    {step === -1 && <>
                        {`Go Discord Support`}
                    </>}
                    {step === 0 && <>
                        {`Let’s Go`}
                    </>}
                    {step === 1 && <>
                        {`Create Custom Reward`}
                    </>}
                    {step === 2 && <>
                        {`Wait a bit`}
                    </>}
                    {step === 3 && <>
                        {`Finish set up`}
                    </>}
                    {step === 4 && <>
                        {overlayLinkCopied ?
                            <>
                                {`Looks awesome! i'm done`}
                            </>
                            :
                            <>
                                {`Copy link to test overlay`}
                            </>
                        }
                    </>}
                    {step === 5 && <>
                        {`Go to dashboard`}
                    </>}
                </Button>
            </div>
            {step !== 5 &&
                <div style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: '12vh',
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
                </div>}

        </div >
    )

}

export default OnBoarding;