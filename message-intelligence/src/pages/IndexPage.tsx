import * as React from 'react';
import {styled} from '@twilio-paste/core/styling-library';
import type {BoxStyleProps} from '@twilio-paste/core/box';
import {Box} from '@twilio-paste/core/box';
import {Anchor} from '@twilio-paste/core/anchor';
import {Button} from '@twilio-paste/core/button';
import {Heading} from '@twilio-paste/core/heading';
import {NewIcon} from '@twilio-paste/icons/esm/NewIcon';
import {LinkExternalIcon} from '@twilio-paste/icons/esm/LinkExternalIcon'
import {HeatmapIcon} from '@twilio-paste/icons/esm/HeatmapIcon'
import { Label, Input, HelpText, Grid, Column, Text, Card, UnorderedList, ListItem } from '@twilio-paste/core';
import { Paragraph } from '@twilio-paste/core';

import { useRef, useState } from "react";



export const IndexPage = (): JSX.Element => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [response, setResponse] = useState([
    // { examples: ['Example 1', 'Example 2', 'Example 3'], summary: 'Test', length: 12 },
    // { examples: ['Example 1', 'Example 2', 'Example 3'], summary: 'Test', length: 12 }
  ]);
  
  async function callBackend (event: any, accountSid: string, authToken: string) {
    event.preventDefault();
  
    console.log(accountSid, authToken);
    await fetch(`http://localhost:8000/cluster/${accountSid}/${authToken}`, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setResponse(data);
      })

    //setResponse(response);
  }

  return (
    <Grid gutter="space30">
      <Column>
        <Box
          margin="space100"
          padding="space60"
          borderRadius="borderRadius20"
          borderStyle="solid"
          borderWidth="borderWidth10"
          borderColor="colorBorder">
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
              Find your account SID in the <Anchor href="https://twilio.com/console">Twilio Console</Anchor>.
            </HelpText>
            <Label htmlFor="email_address" required>Auth Token</Label>
            <Input onChange={(e) => { setAuthToken(e.target.value)}} aria-describedby="email_help_text" id="email_address" name="email_address" type="password" placeholder="••••••••••••••••••••••••••••••" required/>
            <HelpText id="email_help_text">Enter your auth token here.</HelpText>
          </Box>
          <Box
            backgroundColor="colorBackgroundWarningWeakest"
            display="inline-block"
            padding="space40"
            marginBottom="space60"
          >
            Warning: All message data in your account will be shared with OpenAI and may be stored for an indeterminate amount of time. Use only with a personal demo account.
          </Box>
          <Button variant="primary" onClick={(event) => callBackend(event, accountSid, authToken)}>
            <NewIcon decorative />
            Summarize Messages
          </Button>
        </Box>
      </Column>

      <Column>
        <Box
          margin="space100"
          minHeight={'50vh'}
        >
          <Heading as="h1" variant="heading10">
            Message Results
            <HeatmapIcon decorative={false} size="sizeIcon80" title="Description of icon" />
          </Heading>
          {response.map(function(cluster:any, i){
              return (
                <Card key={i}>
                  <Text as='p'>Summary: {cluster.summary}</Text>
                  <Text as='p'>Count: {cluster.length}</Text>
                  <Text as='p'>Examples:</Text>
                  <UnorderedList>
                    {cluster.examples.map((example: string, j:number) => {
                      return <ListItem key={j}>{example}</ListItem>
                    })}
                  </UnorderedList>
                </Card>
              );
          })}
        </Box>
      </Column>
    </Grid>
  );
};

IndexPage.displayName = 'IndexPage';
