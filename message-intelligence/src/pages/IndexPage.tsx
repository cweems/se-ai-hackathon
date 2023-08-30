import * as React from 'react';
import {styled} from '@twilio-paste/core/styling-library';
import type {BoxStyleProps} from '@twilio-paste/core/box';
import {Box} from '@twilio-paste/core/box';
import {Anchor} from '@twilio-paste/core/anchor';
import {Button} from '@twilio-paste/core/button';
import {Heading} from '@twilio-paste/core/heading';
import {NewIcon} from '@twilio-paste/icons/esm/NewIcon';
import {LinkExternalIcon} from '@twilio-paste/icons/esm/LinkExternalIcon'
import { Label, Input, HelpText } from '@twilio-paste/core';
import { Paragraph } from '@twilio-paste/core';

import { useRef, useState } from "react";



export const IndexPage = (): JSX.Element => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  
  async function callBackend (event: any, accountSid: string, authToken: string) {
    event.preventDefault();
    console.log(accountSid, authToken)
  
    const response = await fetch('/cluster', {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({}), // body data type must match "Content-Type" header
    })
  }

  return (
    <Box
      margin="space100"
      padding="space60"
      borderRadius="borderRadius20"
      borderStyle="solid"
      borderWidth="borderWidth10"
      borderColor="colorBorder"
      width={'40%'}>
      <Heading as="h1" variant="heading10">
        Twilio Messaging Intelligence ✨
      </Heading>
      <Paragraph>
        Quickly understand messaging use-cases in your Twilio account.
      </Paragraph>
      <Box
        marginTop="space60"
        marginBottom="space60"
      >
        <Label htmlFor="email_address" required>Account SID</Label>
        <Input onChange={(e) => { setAccountSid(e.target.value)}} aria-describedby="email_help_text" id="email_address" name="email_address" type="text" placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" required/>
        <HelpText id="email_help_text">
          Find your account SID in the <Anchor href="https://twilio.com/console">Twilio Console <LinkExternalIcon decorative={true} title="Description of icon" /></Anchor>
        </HelpText>
        <Label htmlFor="email_address" required>Auth Token</Label>
        <Input onChange={(e) => { setAuthToken(e.target.value)}} aria-describedby="email_help_text" id="email_address" name="email_address" type="password" placeholder="secrets.... here...." required/>
        <HelpText id="email_help_text">Enter your Twilio Account SID here.</HelpText>
      </Box>
      <Button variant="primary" onClick={(event) => callBackend(event, accountSid, authToken)}>
        <NewIcon decorative />
        Summarize Messages
      </Button>
    </Box>
  );
};

IndexPage.displayName = 'IndexPage';
